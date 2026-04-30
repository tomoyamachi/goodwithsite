import { resolve } from 'path'
import { writeFile } from './fs-helpers'
import { getAllPostsMeta, PostMeta } from './posts'
import { getBlogLink } from './blog-helpers'

// must use weird syntax to bypass auto replacing of NODE_ENV
process.env['NODE' + '_ENV'] = 'production'

const NOW = new Date().toJSON()
const DOMAIN = 'https://www.goodwith.tech'

function decode(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function mapToEntry(post: PostMeta) {
  const link = `${DOMAIN}${getBlogLink(post.slug)}`
  const updated = new Date(post.date).toJSON()
  const summary = decode(post.description || post.title)
  const authors = (post.authors ?? [])
    .map((a) => `<author><name>${decode(a)}</name></author>`)
    .join('')
  return `
    <entry>
      <id>${link}</id>
      <title>${decode(post.title)}</title>
      <link href="${link}"/>
      <updated>${updated}</updated>
      <summary>${summary}</summary>
      ${authors}
    </entry>`
}

function createRSS(posts: PostMeta[]) {
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>GOODWITH LLC blog</title>
  <subtitle>Posts from goodwith.tech</subtitle>
  <link href="${DOMAIN}/feed/feed.xml" rel="self" type="application/atom+xml"/>
  <link href="${DOMAIN}/" rel="alternate" type="text/html"/>
  <id>${DOMAIN}/</id>
  <updated>${NOW}</updated>
  ${posts.map(mapToEntry).join('')}
</feed>
`
}

async function main() {
  const posts = getAllPostsMeta()
  // 過去のURL `goodwith.tech/feed` を維持するため、ファイルとして書き出す
  const outPath = resolve('public', 'feed')
  await writeFile(outPath, createRSS(posts), 'utf8')
  console.log(`Wrote ${outPath} (${posts.length} entries)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
