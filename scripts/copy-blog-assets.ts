/**
 * content/blog/<dir>/ 配下の画像を public/blog-assets/<slug>/ にコピーする。
 * ビルド前に実行（npm run prebuild）。
 */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog')
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'blog-assets')
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'])

function copyAssets() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.log('No content/blog directory, skipping asset copy')
    return
  }

  // 既存の出力をクリア
  if (fs.existsSync(PUBLIC_DIR)) {
    fs.rmSync(PUBLIC_DIR, { recursive: true, force: true })
  }
  fs.mkdirSync(PUBLIC_DIR, { recursive: true })

  const dirs = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())

  let copied = 0
  for (const d of dirs) {
    const indexPath = path.join(CONTENT_DIR, d.name, 'index.md')
    if (!fs.existsSync(indexPath)) continue
    const raw = fs.readFileSync(indexPath, 'utf8')
    const slug = (matter(raw).data as { slug?: string }).slug
    if (!slug) {
      console.warn(`Skipping ${d.name}: no slug in frontmatter`)
      continue
    }

    const dest = path.join(PUBLIC_DIR, slug)
    fs.mkdirSync(dest, { recursive: true })

    const files = fs.readdirSync(path.join(CONTENT_DIR, d.name))
    for (const f of files) {
      const ext = path.extname(f).toLowerCase()
      if (!IMAGE_EXT.has(ext)) continue
      fs.copyFileSync(
        path.join(CONTENT_DIR, d.name, f),
        path.join(dest, f)
      )
      copied++
    }
  }
  console.log(`Copied ${copied} image(s) to public/blog-assets/`)
}

copyAssets()
