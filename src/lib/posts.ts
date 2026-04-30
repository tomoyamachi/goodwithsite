import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypeStringify from 'rehype-stringify'

export type PostMeta = {
  title: string
  slug: string
  date: string
  authors: string[]
  published: boolean
  description: string
}

export type Post = PostMeta & { html: string }

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog')
const SLUG_REGEX = /^[a-z0-9-]+$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

type RawEntry = {
  dirName: string
  meta: PostMeta
  body: string
}

function readAllRaw(): RawEntry[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  const dirs = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())

  const entries: RawEntry[] = []
  for (const d of dirs) {
    const filePath = path.join(CONTENT_DIR, d.name, 'index.md')
    if (!fs.existsSync(filePath)) continue
    const raw = fs.readFileSync(filePath, 'utf8')
    const parsed = matter(raw)
    const fm = parsed.data as Partial<PostMeta> & { date?: string | Date }

    if (!fm.title || !fm.slug || !fm.date) {
      throw new Error(
        `Invalid frontmatter in ${filePath}: title/slug/date are required`
      )
    }
    // gray-matter は YYYY-MM-DD を Date に変換することがあるので文字列化
    const dateStr =
      fm.date instanceof Date
        ? fm.date.toISOString().slice(0, 10)
        : String(fm.date)

    if (!SLUG_REGEX.test(fm.slug)) {
      throw new Error(
        `Invalid slug "${fm.slug}" in ${filePath}: must match /^[a-z0-9-]+$/`
      )
    }
    if (!DATE_REGEX.test(dateStr)) {
      throw new Error(
        `Invalid date "${dateStr}" in ${filePath}: must be YYYY-MM-DD`
      )
    }

    entries.push({
      dirName: d.name,
      meta: {
        title: fm.title,
        slug: fm.slug,
        date: dateStr,
        authors: fm.authors ?? [],
        published: fm.published ?? false,
        description: fm.description ?? '',
      },
      body: parsed.content,
    })
  }

  // slug 重複検証
  const seen = new Set<string>()
  for (const e of entries) {
    if (seen.has(e.meta.slug)) {
      throw new Error(`Duplicate slug "${e.meta.slug}" detected`)
    }
    seen.add(e.meta.slug)
  }
  return entries
}

function isProd(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function getAllPostsMeta(): PostMeta[] {
  const all = readAllRaw().map((e) => e.meta)
  const filtered = isProd() ? all.filter((p) => p.published) : all
  return filtered.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getAllSlugs(): string[] {
  return getAllPostsMeta().map((p) => p.slug)
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const entry = readAllRaw().find((e) => e.meta.slug === slug)
  if (!entry) return null
  if (isProd() && !entry.meta.published) return null

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypePrismPlus, { ignoreMissing: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(entry.body)

  return { ...entry.meta, html: String(file) }
}
