import { resolve } from 'path'
import { writeFile } from './fs-helpers'
import { renderToStaticMarkup } from 'react-dom/server'

import { textBlock } from './notion/renderers'
import getBlogIndex from './notion/getBlogIndex'
import getNotionUsers from './notion/getNotionUsers'
import { postIsPublished, getBlogLink } from './blog-helpers'

// must use weird syntax to bypass auto replacing of NODE_ENV
process.env['NODE' + '_ENV'] = 'production'

// constants
const DOMAIN = 'https://www.goodwith.tech'

const createSitemap = (posts) => {
  return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
    <url>
        <loc>${DOMAIN}</loc>
        <priority>1.00</priority>
    </url>
    <url>
        <loc>https://www.goodwith.tech/blog</loc>
        <priority>0.80</priority>
    </url>
    ${posts
      .map(({ link }) => {
        return `
    <url><loc>${`${DOMAIN}${link}`}</loc><priority>0.64</priority></url>`
      })
      .join('')}
</urlset>
`
}

async function main() {
  const postsTable = await getBlogIndex(true)
  const neededAuthors = new Set<string>()

  const blogPosts = Object.keys(postsTable)
    .map((slug) => {
      const post = postsTable[slug]
      if (!postIsPublished(post)) return

      post.authors = post.Authors || []

      for (const author of post.authors) {
        neededAuthors.add(author)
      }
      return post
    })
    .filter(Boolean)

  const { users } = await getNotionUsers([...neededAuthors])

  blogPosts.forEach((post) => {
    post.authors = post.authors.map((id) => users[id])
    post.link = getBlogLink(post.Slug)
    post.title = post.Page
    post.date = post.Date
  })

  const outputPath = './public/sitemap.xml'
  await writeFile(resolve(outputPath), createSitemap(blogPosts))
  console.log(`sitemap.xml file generated at \`${outputPath}\``)
}

main().catch((error) => console.error(error))
