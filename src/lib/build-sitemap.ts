import { resolve } from 'path'
import { writeFile } from './fs-helpers'
import { getAllPostsMeta, PostMeta } from './posts'
import { getBlogLink } from './blog-helpers'

// must use weird syntax to bypass auto replacing of NODE_ENV
process.env['NODE' + '_ENV'] = 'production'

const DOMAIN = 'https://www.goodwith.tech'

function createSitemap(posts: PostMeta[]) {
  return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url><loc>${DOMAIN}</loc><priority>1.00</priority></url>
  <url><loc>${DOMAIN}/blog</loc><priority>0.80</priority></url>
${posts
  .map(
    (p) =>
      `  <url><loc>${DOMAIN}${getBlogLink(p.slug)}</loc><priority>0.64</priority></url>`
  )
  .join('\n')}
</urlset>
`
}

async function main() {
  const posts = getAllPostsMeta()
  const outPath = resolve('public', 'sitemap.xml')
  await writeFile(outPath, createSitemap(posts), 'utf8')
  console.log(`Wrote ${outPath} (${posts.length} entries)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
