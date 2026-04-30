/**
 * Notion 上の全記事を content/blog/<YYYY-MM-DD-slug>/ に Markdown で書き出す。
 * 画像も同フォルダに DL する。ワンショット実行用。
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { Sema } from 'async-sema'

// 既存の Notion クライアントを流用（移行完了後に Notion 関連は削除予定）
import getBlogIndex from '../src/lib/notion/getBlogIndex'
import getPageData from '../src/lib/notion/getPageData'
import getNotionUsers from '../src/lib/notion/getNotionUsers'
import getNotionAsset from '../src/lib/notion/getNotionAssetUrls'
import { blocksToMarkdown, Todo } from './lib/notion-to-md'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog')
const SLUG_REGEX = /^[a-z0-9-]+$/

type Summary = {
  slug: string
  outDir: string
  todos: Todo[]
  imagesOk: number
  imagesNg: number
}

function toIsoDate(date: any): string {
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.slice(0, 10)
  }
  if (typeof date === 'number') {
    return new Date(date).toISOString().slice(0, 10)
  }
  // Notion の date オブジェクト形式
  if (date?.start_date) return String(date.start_date).slice(0, 10)
  return new Date().toISOString().slice(0, 10)
}

function inferExtFromUrl(url: string): string {
  const m = url.match(/\.(png|jpe?g|gif|svg|webp)(\?|$)/i)
  if (m) return m[1].toLowerCase().replace('jpeg', 'jpg')
  return 'png'
}

async function downloadImage(
  blockId: string,
  displaySource: string,
  outDir: string
): Promise<string | null> {
  try {
    const fakeRes: any = {
      json: () => undefined,
    }
    const result = await getNotionAsset(fakeRes, displaySource, blockId)
    const signed = result.signedUrls?.[0] ?? displaySource
    const ext = inferExtFromUrl(signed)
    const filename = `${blockId.replace(/-/g, '')}.${ext}`
    const res = await fetch(signed)
    if (!res.ok) {
      console.warn(`[image] HTTP ${res.status} for ${blockId}`)
      return null
    }
    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(path.join(outDir, filename), buf)
    return filename
  } catch (e) {
    console.warn(`[image] failed for ${blockId}:`, (e as Error).message)
    return null
  }
}

async function main() {
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true })

  console.log('Loading Notion blog index...')
  const postsTable = await getBlogIndex(false)
  const slugs = Object.keys(postsTable)
  console.log(`Found ${slugs.length} posts in Notion.`)

  const authorIds = new Set<string>()
  for (const s of slugs) {
    for (const a of postsTable[s].Authors ?? []) authorIds.add(a)
  }
  const { users } = await getNotionUsers([...authorIds])

  const summaries: Summary[] = []
  const sema = new Sema(2, { capacity: slugs.length })

  await Promise.all(
    slugs.map(async (slug) => {
      await sema.acquire()
      try {
        const post = postsTable[slug]
        if (!post.Slug || !SLUG_REGEX.test(post.Slug)) {
          console.warn(
            `Skipping post with invalid slug: ${slug} (Slug=${post.Slug})`
          )
          return
        }
        const dateIso = toIsoDate(post.Date)
        const dirName = `${dateIso}-${post.Slug}`
        const outDir = path.join(CONTENT_DIR, dirName)
        fs.mkdirSync(outDir, { recursive: true })

        // ページ本文取得
        const { blocks } = await getPageData(post.id)

        // 画像 DL（並列度抑えめ）
        const imageMap: Record<string, string> = {}
        let imagesOk = 0
        let imagesNg = 0
        for (const b of blocks) {
          if (b.value?.type !== 'image') continue
          const ds = b.value.format?.display_source
          if (!ds) {
            imagesNg++
            continue
          }
          const fname = await downloadImage(b.value.id, ds, outDir)
          if (fname) {
            imageMap[b.value.id] = fname
            imagesOk++
          } else {
            imagesNg++
          }
        }

        // Markdown 生成
        const { markdown, todos } = blocksToMarkdown(blocks, imageMap)

        // frontmatter
        const authors = (post.Authors ?? [])
          .map((id: string) => users[id]?.full_name)
          .filter(Boolean)

        const frontmatter = [
          '---',
          `title: ${JSON.stringify(post.Page ?? '')}`,
          `slug: ${post.Slug}`,
          `date: ${dateIso}`,
          authors.length
            ? `authors:\n${authors.map((a: string) => `  - ${a}`).join('\n')}`
            : 'authors: []',
          `published: ${post.Published === 'Yes'}`,
          `description: ${JSON.stringify('')}`,
          '---',
          '',
        ].join('\n')

        fs.writeFileSync(path.join(outDir, 'index.md'), frontmatter + markdown)
        summaries.push({
          slug: post.Slug,
          outDir: dirName,
          todos,
          imagesOk,
          imagesNg,
        })
        console.log(
          `✓ ${dirName} (images ${imagesOk}/${imagesOk + imagesNg}, todos ${
            todos.length
          })`
        )
      } catch (e) {
        console.error(`✗ ${slug}:`, e)
      } finally {
        sema.release()
      }
    })
  )

  // サマリ
  console.log('\n=== Migration Summary ===')
  console.log(`Total: ${summaries.length} posts`)
  const withTodos = summaries.filter((s) => s.todos.length > 0)
  console.log(`Posts with TODOs: ${withTodos.length}`)
  for (const s of withTodos) {
    console.log(`  ${s.outDir}: ${s.todos.length} TODO(s)`)
    for (const t of s.todos) {
      console.log(`    - [${t.type}] ${t.blockId} ${t.note}`)
    }
  }
  const totalNg = summaries.reduce((sum, s) => sum + s.imagesNg, 0)
  console.log(`Image download failures: ${totalNg}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
