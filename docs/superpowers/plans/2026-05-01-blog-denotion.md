# Blog Notion 依存撤去 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/blog` を Notion 非公式 API 依存から、ローカル Markdown ファイルベースの純 SSG 構成に移行する。

**Architecture:** `content/blog/<YYYY-MM-DD-slug>/index.md` を `gray-matter` + `remark`/`rehype` パイプラインで HTML 化、Next.js SSG で配信。既存記事はワンショットスクリプトで Notion から Markdown に書き出し、画像も同フォルダに DL する。移行完了後に Notion 関連コード一式を撤去。

**Tech Stack:** Next.js 14 / TypeScript / gray-matter / remark / remark-gfm / remark-rehype / rehype-slug / rehype-autolink-headings / rehype-prism-plus / rehype-stringify

**Spec:** `docs/superpowers/specs/2026-05-01-blog-denotion-design.md`

---

## ファイル構成

### 新規作成

- `content/blog/.gitkeep` — ディレクトリ存在確認用
- `src/lib/posts.ts` — Markdown ローダー（frontmatter パース、HTML 変換、バリデーション）
- `src/lib/rehype-relative-images.ts` — 自前 rehype プラグイン（画像相対パス → `/blog-assets/<slug>/...` 書き換え）
- `scripts/copy-blog-assets.ts` — `content/blog/*/` の画像を `public/blog-assets/<slug>/` にコピー
- `scripts/migrate-notion-to-markdown.ts` — ワンショット Notion → Markdown 移行スクリプト
- `scripts/lib/notion-to-md.ts` — Notion ブロック → Markdown 変換ロジック
- `tests/posts.test.ts` — `src/lib/posts.ts` のユニットテスト（vitest 想定）
- `tests/notion-to-md.test.ts` — ブロック変換のユニットテスト

### 改修

- `src/pages/blog/index.tsx` — Notion 依存削除、`getAllPostsMeta()` 利用
- `src/pages/blog/[slug].tsx` — Notion 依存削除、`getPostBySlug()` 利用、HTML 直挿し
- `src/lib/build-rss.ts` — 新ローダー利用に変更
- `src/lib/build-sitemap.ts` — 新ローダー利用に変更
- `src/styles/blog.module.css` — preview モード CSS 削除、`pre code` スタイル追加
- `src/components/layout/header.tsx` — `<Notion>` SVG 等の参照があれば確認（`src/components/svgs/notion.tsx` の使用箇所）
- `package.json` — 依存追加・削除、`build` スクリプト変更
- `readme.md` — Notion 関連手順削除
- `next.config.js` — Notion 関連設定があれば削除

### 削除（最終ステップ）

- `src/lib/notion/` ディレクトリ全体
- `src/pages/api/asset.ts`
- `src/pages/api/preview.ts`
- `src/pages/api/preview-post.ts`
- `src/pages/api/clear-preview.ts`
- `src/components/dynamic.tsx`
- `src/components/code.tsx`
- `src/components/equation.tsx`
- `src/components/heading.tsx`
- `src/components/svgs/notion.tsx`（使用されていなければ）
- `scripts/migrate-notion-to-markdown.ts` と `scripts/lib/notion-to-md.ts`（移行成功後）

---

## Task 1: テスト基盤と依存追加

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/.gitkeep`

- [ ] **Step 1: 新規依存をインストール**

```bash
npm install gray-matter remark remark-parse remark-gfm remark-rehype rehype-slug rehype-autolink-headings rehype-prism-plus rehype-stringify unified
npm install -D vitest @vitest/ui tsx
```

- [ ] **Step 2: `vitest.config.ts` を作成**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
```

- [ ] **Step 3: `package.json` の `scripts` に test を追加**

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: `tests/.gitkeep` を作成**

```bash
mkdir -p tests && touch tests/.gitkeep
```

- [ ] **Step 5: ビルドが通ることを確認**

Run: `npm run build`
Expected: 既存ビルド成功（Notion トークン有効前提）

- [ ] **Step 6: コミット**

```bash
git add package.json package-lock.json vitest.config.ts tests/.gitkeep
git commit -m "[blog] Markdown化のためのvitest/remark/rehype依存を追加"
```

---

## Task 2: `src/lib/posts.ts` のテストとスケルトン

**Files:**
- Create: `tests/posts.test.ts`
- Create: `src/lib/posts.ts`
- Create: `content/blog/.gitkeep`
- Create: `content/blog/2024-01-15-sample-post/index.md`（テスト用ダミー記事）

- [ ] **Step 1: `content/blog/.gitkeep` 作成**

```bash
mkdir -p content/blog && touch content/blog/.gitkeep
```

- [ ] **Step 2: テスト用ダミー記事を作成**

`content/blog/2024-01-15-sample-post/index.md`:

```md
---
title: サンプル記事
slug: sample-post
date: 2024-01-15
authors:
  - 天地 知也
published: true
description: テスト用のサンプル記事
---

# 見出し1

これは本文です。

## 見出し2

- リスト項目1
- リスト項目2

\`\`\`ts
const hello = 'world'
\`\`\`
```

- [ ] **Step 3: 失敗するテストを書く**

`tests/posts.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getAllPostsMeta, getPostBySlug, getAllSlugs } from '../src/lib/posts'

describe('posts loader', () => {
  it('lists all published posts metadata', () => {
    const posts = getAllPostsMeta()
    expect(posts.length).toBeGreaterThan(0)
    const sample = posts.find((p) => p.slug === 'sample-post')
    expect(sample).toBeDefined()
    expect(sample!.title).toBe('サンプル記事')
    expect(sample!.date).toBe('2024-01-15')
    expect(sample!.authors).toEqual(['天地 知也'])
    expect(sample!.published).toBe(true)
  })

  it('returns slugs only', () => {
    const slugs = getAllSlugs()
    expect(slugs).toContain('sample-post')
  })

  it('returns post with rendered HTML', async () => {
    const post = await getPostBySlug('sample-post')
    expect(post.title).toBe('サンプル記事')
    expect(post.html).toContain('<h1')
    expect(post.html).toContain('見出し1')
    expect(post.html).toContain('<code')
  })

  it('returns null for unknown slug', async () => {
    const post = await getPostBySlug('nonexistent')
    expect(post).toBeNull()
  })
})
```

- [ ] **Step 4: テスト実行（失敗確認）**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/lib/posts'`

- [ ] **Step 5: `src/lib/posts.ts` を実装**

```ts
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
    const fm = parsed.data as Partial<PostMeta>

    if (!fm.title || !fm.slug || !fm.date) {
      throw new Error(`Invalid frontmatter in ${filePath}: title/slug/date are required`)
    }
    if (!SLUG_REGEX.test(fm.slug)) {
      throw new Error(`Invalid slug "${fm.slug}" in ${filePath}: must match /^[a-z0-9-]+$/`)
    }
    if (!DATE_REGEX.test(fm.date)) {
      throw new Error(`Invalid date "${fm.date}" in ${filePath}: must be YYYY-MM-DD`)
    }

    entries.push({
      dirName: d.name,
      meta: {
        title: fm.title,
        slug: fm.slug,
        date: fm.date,
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
```

- [ ] **Step 6: テスト実行（成功確認）**

Run: `npm test`
Expected: PASS（4 tests）

- [ ] **Step 7: コミット**

```bash
git add tests/posts.test.ts src/lib/posts.ts content/blog/.gitkeep content/blog/2024-01-15-sample-post/
git commit -m "[blog] Markdownローダー(src/lib/posts.ts)とサンプル記事を追加"
```

---

## Task 3: 画像相対パス書き換えプラグイン

**Files:**
- Create: `src/lib/rehype-relative-images.ts`
- Modify: `src/lib/posts.ts`（プラグイン組み込み）
- Modify: `tests/posts.test.ts`（テスト追加）
- Modify: `content/blog/2024-01-15-sample-post/index.md`（画像参照追加）
- Create: `content/blog/2024-01-15-sample-post/dummy.png`（1px ダミー画像）

- [ ] **Step 1: ダミー画像を作成（base64 で 1x1 PNG）**

```bash
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff\xff?\x00\x05\xfe\x02\xfe\xa3\x06\xc7\x91\x00\x00\x00\x00IEND\xaeB`\x82' > content/blog/2024-01-15-sample-post/dummy.png
```

- [ ] **Step 2: サンプル記事に画像参照を追加**

`content/blog/2024-01-15-sample-post/index.md` の本文末尾に追加:

```md

![dummy image](./dummy.png)
```

- [ ] **Step 3: テストを追加（失敗確認のため）**

`tests/posts.test.ts` に追加:

```ts
  it('rewrites relative image paths to /blog-assets/<slug>/...', async () => {
    const post = await getPostBySlug('sample-post')
    expect(post!.html).toContain('/blog-assets/sample-post/dummy.png')
    expect(post!.html).not.toContain('./dummy.png')
  })
```

- [ ] **Step 4: テスト実行（失敗確認）**

Run: `npm test`
Expected: FAIL — `expected '...' to contain '/blog-assets/sample-post/dummy.png'`

- [ ] **Step 5: rehype プラグインを実装**

`src/lib/rehype-relative-images.ts`:

```ts
import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root, Element } from 'hast'

type Options = { slug: string }

const rehypeRelativeImages: Plugin<[Options], Root> = ({ slug }) => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'img') return
      const src = node.properties?.src
      if (typeof src !== 'string') return
      if (!src.startsWith('./')) return
      const filename = src.slice(2)
      node.properties!.src = `/blog-assets/${slug}/${filename}`
    })
  }
}

export default rehypeRelativeImages
```

- [ ] **Step 6: `unist-util-visit` を依存追加**

```bash
npm install unist-util-visit
```

- [ ] **Step 7: `src/lib/posts.ts` でプラグインを組み込む**

`src/lib/posts.ts` の `getPostBySlug` 内のパイプラインを変更：

```ts
import rehypeRelativeImages from './rehype-relative-images'

// ...

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeRelativeImages, { slug: entry.meta.slug })
    .use(rehypePrismPlus, { ignoreMissing: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(entry.body)
```

- [ ] **Step 8: テスト実行（成功確認）**

Run: `npm test`
Expected: PASS（5 tests）

- [ ] **Step 9: コミット**

```bash
git add src/lib/rehype-relative-images.ts src/lib/posts.ts tests/posts.test.ts content/blog/2024-01-15-sample-post/ package.json package-lock.json
git commit -m "[blog] 画像の相対パスを/blog-assets/<slug>/に書き換えるrehypeプラグインを追加"
```

---

## Task 4: ブログ画像コピースクリプト

**Files:**
- Create: `scripts/copy-blog-assets.ts`
- Modify: `package.json`（scripts 追加）

- [ ] **Step 1: スクリプトを作成**

`scripts/copy-blog-assets.ts`:

```ts
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
```

- [ ] **Step 2: 実行確認**

Run: `npx tsx scripts/copy-blog-assets.ts`
Expected: `Copied 1 image(s) to public/blog-assets/`

- [ ] **Step 3: 出力検証**

Run: `ls public/blog-assets/sample-post/`
Expected: `dummy.png`

- [ ] **Step 4: `.gitignore` に `public/blog-assets/` を追加**

`.gitignore` に追記:

```
public/blog-assets/
```

- [ ] **Step 5: コミット**

```bash
git add scripts/copy-blog-assets.ts .gitignore
git commit -m "[blog] content/blog/配下の画像をpublic/blog-assets/にコピーするスクリプト追加"
```

---

## Task 5: blog index ページの差し替え

**Files:**
- Modify: `src/pages/blog/index.tsx`

- [ ] **Step 1: 既存実装を確認**

Run: `cat src/pages/blog/index.tsx`
Expected: 既存の Notion 依存実装が表示される

- [ ] **Step 2: 新実装で全置換**

`src/pages/blog/index.tsx`:

```tsx
import Link from 'next/link'
import Header from '../../components/layout/header'

import blogStyles from '../../styles/blog.module.css'
import sharedStyles from '../../styles/shared.module.css'

import { getBlogLink, getDateStr } from '../../lib/blog-helpers'
import { getAllPostsMeta, PostMeta } from '../../lib/posts'

export async function getStaticProps() {
  const posts = getAllPostsMeta()
  return { props: { posts } }
}

const Index = ({ posts }: { posts: PostMeta[] }) => {
  return (
    <>
      <Header titlePre="Blog" />
      <div className={`${sharedStyles.layout} ${blogStyles.blogIndex}`}>
        <h1>Posts</h1>
        {posts.length === 0 && (
          <p className={blogStyles.noPosts}>There are no posts yet</p>
        )}
        {posts.map((post) => (
          <div className={blogStyles.postPreview} key={post.slug}>
            <h3>
              <span className={blogStyles.titleContainer}>
                {!post.published && (
                  <span className={blogStyles.draftBadge}>Draft</span>
                )}
                <Link href="/blog/[slug]" as={getBlogLink(post.slug)}>
                  {post.title}
                </Link>
              </span>
            </h3>
            {post.authors.length > 0 && (
              <span className={blogStyles.author}>
                By {post.authors.join(' ')}
              </span>
            )}
            {post.date && (
              <span className={blogStyles.posted}> at {getDateStr(post.date)}</span>
            )}
            {post.description && <p>{post.description}</p>}
          </div>
        ))}
      </div>
    </>
  )
}

export default Index
```

- [ ] **Step 3: 開発サーバーを起動して `/blog` を確認**

Run: `npm run dev`（バックグラウンド）

別端末:
```bash
curl -s http://localhost:3000/blog | grep -o "サンプル記事"
```
Expected: `サンプル記事`

- [ ] **Step 4: 開発サーバーを停止**

- [ ] **Step 5: コミット**

```bash
git add src/pages/blog/index.tsx
git commit -m "[blog] /blog一覧をMarkdownローダーベースに置き換え"
```

---

## Task 6: blog detail ページの差し替え

**Files:**
- Modify: `src/pages/blog/[slug].tsx`

- [ ] **Step 1: 新実装で全置換**

`src/pages/blog/[slug].tsx`:

```tsx
import Header from '../../components/layout/header'
import blogStyles from '../../styles/blog.module.css'
import { getDateStr } from '../../lib/blog-helpers'
import { getAllSlugs, getPostBySlug, Post } from '../../lib/posts'

export async function getStaticPaths() {
  return {
    paths: getAllSlugs().map((slug) => ({ params: { slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) {
    return { notFound: true }
  }
  return { props: { post } }
}

const RenderPost = ({ post }: { post: Post }) => {
  return (
    <>
      <Header titlePre={post.title} />
      <div className={blogStyles.post}>
        <h1>{post.title}</h1>
        {post.authors.length > 0 && (
          <div className="authors">By: {post.authors.join(' ')}</div>
        )}
        {post.date && <div className="posted">Posted: {getDateStr(post.date)}</div>}
        <hr />
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    </>
  )
}

export default RenderPost
```

- [ ] **Step 2: 開発サーバーで `/blog/sample-post` を確認**

Run: `npm run dev`（バックグラウンド）

別端末:
```bash
curl -s http://localhost:3000/blog/sample-post | grep -o "見出し1"
```
Expected: `見出し1`

- [ ] **Step 3: 画像表示を確認（先に copy-blog-assets を実行）**

```bash
npx tsx scripts/copy-blog-assets.ts
curl -s http://localhost:3000/blog/sample-post | grep -o "/blog-assets/sample-post/dummy.png"
```
Expected: `/blog-assets/sample-post/dummy.png`

- [ ] **Step 4: 開発サーバーを停止**

- [ ] **Step 5: コミット**

```bash
git add src/pages/blog/[slug].tsx
git commit -m "[blog] /blog/[slug]詳細ページをMarkdownローダーベースに置き換え"
```

---

## Task 7: （削除：Task 11 で build スクリプト変更を統合）

このタスクは Task 11 に統合した。RSS/sitemap の切り替えと build スクリプト変更を同時に行うため。

---

## Task 8: Notion → Markdown 移行スクリプトの中核（変換ロジック）

**Files:**
- Create: `scripts/lib/notion-to-md.ts`
- Create: `tests/notion-to-md.test.ts`

- [ ] **Step 1: 失敗するテストを書く**

`tests/notion-to-md.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { blocksToMarkdown, richTextToInline } from '../scripts/lib/notion-to-md'

describe('richTextToInline', () => {
  it('plain text', () => {
    expect(richTextToInline([['hello']])).toBe('hello')
  })

  it('bold', () => {
    expect(richTextToInline([['hello', [['b']]]])).toBe('**hello**')
  })

  it('italic', () => {
    expect(richTextToInline([['hello', [['i']]]])).toBe('*hello*')
  })

  it('inline code', () => {
    expect(richTextToInline([['hello', [['c']]]])).toBe('`hello`')
  })

  it('link', () => {
    expect(richTextToInline([['Anthropic', [['a', 'https://anthropic.com']]]])).toBe(
      '[Anthropic](https://anthropic.com)'
    )
  })

  it('multiple chunks', () => {
    expect(
      richTextToInline([['hello, '], ['world', [['b']]]])
    ).toBe('hello, **world**')
  })
})

describe('blocksToMarkdown', () => {
  it('renders text block', () => {
    const blocks = [
      { value: { id: 'b1', type: 'text', properties: { title: [['hello']] } } },
    ]
    expect(blocksToMarkdown(blocks, {}).markdown.trim()).toBe('hello')
  })

  it('renders headers', () => {
    const blocks = [
      { value: { id: 'b1', type: 'header', properties: { title: [['H1']] } } },
      { value: { id: 'b2', type: 'sub_header', properties: { title: [['H2']] } } },
      { value: { id: 'b3', type: 'sub_sub_header', properties: { title: [['H3']] } } },
    ]
    const md = blocksToMarkdown(blocks, {}).markdown
    expect(md).toContain('# H1')
    expect(md).toContain('## H2')
    expect(md).toContain('### H3')
  })

  it('renders bulleted_list', () => {
    const blocks = [
      { value: { id: 'b1', type: 'bulleted_list', properties: { title: [['item1']] } } },
      { value: { id: 'b2', type: 'bulleted_list', properties: { title: [['item2']] } } },
    ]
    const md = blocksToMarkdown(blocks, {}).markdown
    expect(md).toContain('- item1')
    expect(md).toContain('- item2')
  })

  it('renders code block', () => {
    const blocks = [
      {
        value: {
          id: 'b1',
          type: 'code',
          properties: {
            title: [['const x = 1']],
            language: [['JavaScript']],
          },
        },
      },
    ]
    const md = blocksToMarkdown(blocks, {}).markdown
    expect(md).toContain('```javascript')
    expect(md).toContain('const x = 1')
    expect(md).toContain('```')
  })

  it('renders divider', () => {
    const blocks = [{ value: { id: 'b1', type: 'divider', properties: {} } }]
    expect(blocksToMarkdown(blocks, {}).markdown).toContain('---')
  })

  it('renders quote', () => {
    const blocks = [
      { value: { id: 'b1', type: 'quote', properties: { title: [['quoted text']] } } },
    ]
    expect(blocksToMarkdown(blocks, {}).markdown).toContain('> quoted text')
  })

  it('renders image with provided filename', () => {
    const blocks = [
      {
        value: {
          id: 'b1',
          type: 'image',
          properties: {},
          format: { display_source: 'https://notion/img.png' },
        },
      },
    ]
    const md = blocksToMarkdown(blocks, { b1: 'b1.png' }).markdown
    expect(md).toContain('![](./b1.png)')
  })

  it('emits TODO for tweet/embed/unknown', () => {
    const blocks = [
      {
        value: {
          id: 'b1',
          type: 'tweet',
          properties: { source: [['https://twitter.com/x/status/1']] },
        },
      },
      {
        value: {
          id: 'b2',
          type: 'embed',
          properties: {},
          format: { display_source: 'https://example.com' },
        },
      },
      { value: { id: 'b3', type: 'mystery_type', properties: {} } },
    ]
    const result = blocksToMarkdown(blocks, {})
    expect(result.markdown).toContain('<!-- TODO: tweet')
    expect(result.markdown).toContain('<!-- TODO: embed')
    expect(result.markdown).toContain('<!-- TODO: unknown type "mystery_type"')
    expect(result.todos.length).toBe(3)
  })
})
```

- [ ] **Step 2: テスト実行（失敗確認）**

Run: `npm test`
Expected: FAIL — `Cannot find module '../scripts/lib/notion-to-md'`

- [ ] **Step 3: 変換ロジックを実装**

`scripts/lib/notion-to-md.ts`:

```ts
type RichTextChunk = [string] | [string, Array<[string, string?]>]

export function richTextToInline(rich: RichTextChunk[] = []): string {
  if (!Array.isArray(rich)) return ''
  return rich
    .map((chunk) => {
      const text = chunk[0] ?? ''
      const tags = chunk[1] ?? []
      let out = text
      for (const tag of tags) {
        const t = tag[0]
        if (t === 'b') out = `**${out}**`
        else if (t === 'i') out = `*${out}*`
        else if (t === 'c') out = `\`${out}\``
        else if (t === 's') out = `~~${out}~~`
        else if (t === 'a') out = `[${out}](${tag[1] ?? ''})`
        // 'e' (equation), '_' (underline) などは現状そのまま
      }
      return out
    })
    .join('')
}

type Block = {
  value: {
    id: string
    type: string
    properties?: any
    format?: any
  }
}

export type Todo = {
  blockId: string
  type: string
  note: string
}

export type ConvertResult = {
  markdown: string
  todos: Todo[]
}

/**
 * @param blocks Notion ブロック配列
 * @param imageFiles blockId → 保存後のファイル名 のマップ
 */
export function blocksToMarkdown(
  blocks: Block[],
  imageFiles: Record<string, string>
): ConvertResult {
  const lines: string[] = []
  const todos: Todo[] = []

  // numbered_list の連番管理
  let numberedCounter = 0
  let prevType = ''

  for (const b of blocks) {
    const v = b.value
    const t = v.type
    const p = v.properties ?? {}

    if (t !== 'numbered_list') numberedCounter = 0

    switch (t) {
      case 'page':
        break
      case 'text': {
        const text = richTextToInline(p.title)
        if (text) lines.push(text, '')
        else lines.push('')
        break
      }
      case 'header':
        lines.push(`# ${richTextToInline(p.title)}`, '')
        break
      case 'sub_header':
        lines.push(`## ${richTextToInline(p.title)}`, '')
        break
      case 'sub_sub_header':
        lines.push(`### ${richTextToInline(p.title)}`, '')
        break
      case 'bulleted_list':
        lines.push(`- ${richTextToInline(p.title)}`)
        break
      case 'numbered_list':
        numberedCounter++
        lines.push(`${numberedCounter}. ${richTextToInline(p.title)}`)
        break
      case 'quote':
        lines.push(`> ${richTextToInline(p.title)}`, '')
        break
      case 'divider':
        lines.push('---', '')
        break
      case 'callout': {
        const icon = v.format?.page_icon ?? '💡'
        lines.push(`> ${icon} ${richTextToInline(p.title)}`, '')
        break
      }
      case 'code': {
        const content = (p.title?.[0]?.[0] ?? '') as string
        const lang = ((p.language?.[0]?.[0] ?? '') as string).toLowerCase()
        lines.push(`\`\`\`${lang}`, content, '```', '')
        break
      }
      case 'image': {
        const filename = imageFiles[v.id]
        if (filename) {
          lines.push(`![](./${filename})`, '')
        } else {
          const src = v.format?.display_source ?? ''
          lines.push(`<!-- TODO: image download failed for ${v.id} src=${src} -->`, '')
          todos.push({ blockId: v.id, type: 'image', note: `download failed src=${src}` })
        }
        break
      }
      case 'equation': {
        const content = (p.title?.[0]?.[0] ?? '') as string
        lines.push(`<!-- TODO: equation (math support not enabled) -->`)
        lines.push(`$$${content}$$`, '')
        todos.push({ blockId: v.id, type: 'equation', note: 'math support not enabled' })
        break
      }
      case 'tweet': {
        const src = p.source?.[0]?.[0] ?? ''
        lines.push(`<!-- TODO: tweet ${src} -->`, '')
        todos.push({ blockId: v.id, type: 'tweet', note: src })
        break
      }
      case 'embed':
      case 'video': {
        const src = v.format?.display_source ?? ''
        lines.push(`<!-- TODO: embed ${src} -->`, '')
        todos.push({ blockId: v.id, type: t, note: src })
        break
      }
      default:
        lines.push(`<!-- TODO: unknown type "${t}" id=${v.id} -->`, '')
        todos.push({ blockId: v.id, type: t, note: 'unknown' })
        break
    }

    prevType = t
  }

  return { markdown: lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n', todos }
}
```

- [ ] **Step 4: テスト実行（成功確認）**

Run: `npm test`
Expected: PASS（全テスト）

- [ ] **Step 5: コミット**

```bash
git add scripts/lib/notion-to-md.ts tests/notion-to-md.test.ts
git commit -m "[blog] Notionブロック→Markdown変換ロジックを追加"
```

---

## Task 9: 移行スクリプト本体

**Files:**
- Create: `scripts/migrate-notion-to-markdown.ts`

- [ ] **Step 1: スクリプトを作成**

`scripts/migrate-notion-to-markdown.ts`:

```ts
/**
 * Notion 上の全記事を content/blog/<YYYY-MM-DD-slug>/ に Markdown で書き出す。
 * 画像も同フォルダに DL する。ワンショット実行用。
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { Sema } from 'async-sema'

// 既存の Notion クライアントを流用
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
    const fakeRes = {
      json: () => undefined,
    } as any
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
    console.warn(`[image] failed for ${blockId}:`, e)
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
          console.warn(`Skipping post with invalid slug: ${slug} (Slug=${post.Slug})`)
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
            ? `authors:\n${authors.map((a) => `  - ${a}`).join('\n')}`
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
          `✓ ${dirName} (images ${imagesOk}/${imagesOk + imagesNg}, todos ${todos.length})`
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
```

- [ ] **Step 2: dotenv を依存追加**

```bash
npm install -D dotenv
```

- [ ] **Step 3: コミット（実行は次タスク）**

```bash
git add scripts/migrate-notion-to-markdown.ts package.json package-lock.json
git commit -m "[blog] Notion→Markdown移行スクリプトを追加"
```

---

## Task 10: 移行スクリプト実行と出力検証

**Files:**
- 出力: `content/blog/*/`

- [ ] **Step 1: 既存サンプル記事を一旦退避**

```bash
mv content/blog/2024-01-15-sample-post /tmp/sample-post-backup
```

- [ ] **Step 2: 移行スクリプト実行**

Run: `npx tsx scripts/migrate-notion-to-markdown.ts`
Expected: `=== Migration Summary ===` と各記事の `✓` 出力が表示される

- [ ] **Step 3: 出力件数を確認**

```bash
ls -la content/blog/ | grep -c "^d"
```

- [ ] **Step 4: 1記事をランダムに目視確認**

```bash
ls content/blog/ | head -1 | xargs -I{} cat content/blog/{}/index.md | head -40
```
Expected: frontmatter + 本文 Markdown が読める形になっている

- [ ] **Step 5: TDD ローダーがエラー無く全記事をパースできるか確認**

```bash
npm test
```
Expected: PASS（既存テスト全件、新規記事は読み込まれるが個別アサーションはない）

- [ ] **Step 6: バリデーション（slug 重複・形式違反）が出ないか確認**

```bash
npx tsx -e "import('./src/lib/posts').then(m => console.log(m.getAllPostsMeta().length))"
```
Expected: 数値が出力される（エラーなし）

- [ ] **Step 7: 画像コピーを実行**

```bash
npx tsx scripts/copy-blog-assets.ts
ls public/blog-assets/ | head
```
Expected: 各 slug ごとのディレクトリが生成されている

- [ ] **Step 8: 開発サーバー起動して `/blog` と任意の記事ページを確認**

```bash
npm run dev &
sleep 3
curl -s http://localhost:3000/blog | grep -c "postPreview"
```
Expected: 記事数 >= 1

- [ ] **Step 9: 開発サーバー停止**

- [ ] **Step 10: コミット**

```bash
git add content/blog/
git commit -m "[blog] Notionから既存記事をMarkdownに移行"
```

注：TODO コメントが多数残った記事は、ユーザに件数を報告した上で、対応方針を相談する。

---

## Task 11: RSS/sitemap を新ローダーに切り替え

**Files:**
- Modify: `src/lib/build-rss.ts`
- Modify: `src/lib/build-sitemap.ts`

- [ ] **Step 1: `src/lib/build-rss.ts` を全置換**

```ts
import { resolve } from 'path'
import { writeFile } from './fs-helpers'
import { getAllPostsMeta } from './posts'
import { getBlogLink } from './blog-helpers'

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

function mapToEntry(post: ReturnType<typeof getAllPostsMeta>[number]) {
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

function createRSS(posts: ReturnType<typeof getAllPostsMeta>) {
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>GOODWITH LLC blog</title>
  <subtitle>Posts from goodwith.tech</subtitle>
  <link href="${DOMAIN}/feed/feed.xml" rel="self" type="application/atom+xml"/>
  <link href="${DOMAIN}/" rel="alternate" type="text/html"/>
  <id>${DOMAIN}/</id>
  <updated>${NOW}</updated>
  ${posts.map(mapToEntry).join('')}
</feed>`
}

async function main() {
  const posts = getAllPostsMeta()
  const outPath = resolve('public', 'feed', 'feed.xml')
  await writeFile(outPath, createRSS(posts), 'utf8')
  console.log(`Wrote ${outPath} (${posts.length} entries)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
```

- [ ] **Step 2: `src/lib/build-sitemap.ts` を全置換**

```ts
import { resolve } from 'path'
import { writeFile } from './fs-helpers'
import { getAllPostsMeta } from './posts'
import { getBlogLink } from './blog-helpers'

process.env['NODE' + '_ENV'] = 'production'

const DOMAIN = 'https://www.goodwith.tech'

function createSitemap(posts: ReturnType<typeof getAllPostsMeta>) {
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
```

- [ ] **Step 3: 個別実行確認**

```bash
npx tsx src/lib/build-rss.ts
npx tsx src/lib/build-sitemap.ts
```
Expected: `Wrote public/feed/feed.xml (...)` と `Wrote public/sitemap.xml (...)` が表示される

- [ ] **Step 4: 出力検証**

```bash
head -20 public/feed/feed.xml
head -10 public/sitemap.xml
```
Expected: 正しい XML が出力されている

- [ ] **Step 5: `package.json` の build スクリプトを切り替え**

```json
"scripts": {
  "dev": "next dev",
  "start": "next start",
  "prebuild": "npx tsx scripts/copy-blog-assets.ts",
  "build": "next build && npx tsx src/lib/build-rss.ts && npx tsx src/lib/build-sitemap.ts",
  "test": "vitest run",
  "test:watch": "vitest",
  "format": "prettier --write \"**/*.{js,jsx,json,ts,tsx,md,mdx,css,html,yml,yaml,scss,sass}\" --ignore-path .gitignore",
  "lint-staged": "lint-staged"
}
```

- [ ] **Step 6: full build 実行**

```bash
unset USE_CACHE
npm run build
```
Expected: ビルド成功（NOTION_TOKEN はまだ環境にあっても問題なし、参照されないだけ）

- [ ] **Step 7: コミット**

```bash
git add src/lib/build-rss.ts src/lib/build-sitemap.ts package.json
git commit -m "[blog] RSS/sitemap生成とbuildスクリプトをMarkdownベースに切り替え"
```

---

## Task 12: Notion 関連コード一括削除

**Files:**
- Delete: `src/lib/notion/` 全体
- Delete: `src/pages/api/asset.ts`
- Delete: `src/pages/api/preview.ts`
- Delete: `src/pages/api/preview-post.ts`
- Delete: `src/pages/api/clear-preview.ts`
- Delete: `src/components/dynamic.tsx`
- Delete: `src/components/code.tsx`
- Delete: `src/components/equation.tsx`
- Delete: `src/components/heading.tsx`
- Delete: `scripts/migrate-notion-to-markdown.ts`
- Delete: `scripts/lib/notion-to-md.ts`
- Delete: `tests/notion-to-md.test.ts`
- Modify: `package.json`（依存削除）
- Modify: `src/lib/blog-helpers.ts`（不要関数削除）

- [ ] **Step 1: 移行スクリプトと Notion 依存をまだ参照しているか確認**

```bash
grep -r "from.*notion" src/ scripts/ --include="*.ts" --include="*.tsx" | grep -v "scripts/migrate-notion-to-markdown" | grep -v "scripts/lib/notion-to-md"
```
Expected: 出力なし（残っていればそのファイルを修正）

- [ ] **Step 2: ファイル削除**

```bash
rm -rf src/lib/notion/
rm src/pages/api/asset.ts src/pages/api/preview.ts src/pages/api/preview-post.ts src/pages/api/clear-preview.ts
rm src/components/dynamic.tsx src/components/code.tsx src/components/equation.tsx src/components/heading.tsx
rm scripts/migrate-notion-to-markdown.ts scripts/lib/notion-to-md.ts tests/notion-to-md.test.ts
rmdir scripts/lib 2>/dev/null || true
```

- [ ] **Step 3: `src/lib/blog-helpers.ts` から不要関数を削除**

`src/lib/blog-helpers.ts`（最終形）:

```ts
export const getBlogLink = (slug: string) => `/blog/${slug}`

export const getDateStr = (date: string) =>
  new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
```

- [ ] **Step 4: 不要依存を削除**

```bash
npm uninstall react-jsx-parser prismjs katex @types/katex async-sema uuid github-slugger dotenv
```

- [ ] **Step 5: 既存ファイルからの import を grep して残骸を確認**

```bash
grep -rn "react-jsx-parser\|prismjs\|katex\|async-sema\|github-slugger\|uuid" src/ --include="*.ts" --include="*.tsx" --include="*.css" --include="*.module.css"
```
Expected: 出力なし（残っていればその箇所を修正）

- [ ] **Step 6: blog.module.css の preview 関連スタイルを削除**

`src/styles/blog.module.css` から以下を削除：
- `.previewAlertContainer`
- `.previewAlert`
- `.escapePreview`
- `.escapePreview:hover`

そして `pre code` 用のスタイルを末尾に追加：

```css
.post :global(pre) {
  background: #2d2d2d;
  color: #ccc;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}
.post :global(pre code) {
  background: transparent;
  padding: 0;
}
.post :global(code) {
  background: #f4f4f4;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.9em;
}
```

- [ ] **Step 7: ビルドが通ることを確認**

```bash
unset NOTION_TOKEN BLOG_INDEX_ID USE_CACHE
npm run build
```
Expected: ビルド成功

- [ ] **Step 8: テスト実行**

```bash
npm test
```
Expected: PASS

- [ ] **Step 9: 開発サーバーで動作確認**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/blog
curl -s http://localhost:3000/blog | grep -c "postPreview"
kill %1
```
Expected: `200` と記事数 >= 1

- [ ] **Step 10: コミット**

```bash
git add -A
git commit -m "[blog] Notion関連コード・依存・APIルートを一括削除"
```

---

## Task 13: ドキュメント更新

**Files:**
- Modify: `readme.md`
- Modify: `CLAUDE.md`（必要なら）

- [ ] **Step 1: `readme.md` から Notion トークン取得手順を削除し、新しい記事追加手順に書き換える**

`readme.md` の Notion 関連セクションを以下に置換：

```md
## ブログ記事の追加

`content/blog/<YYYY-MM-DD-slug>/index.md` を作成する。

frontmatter:

```yaml
---
title: 記事タイトル
slug: my-post
date: 2024-01-15
authors:
  - 天地 知也
published: true
description: 一覧・OG・RSS 用の概要
---
```

画像は同フォルダに置き、Markdown 内では `./image.png` のように相対パスで参照する。
ビルド時に `public/blog-assets/<slug>/` に自動コピーされる。

`published: false` のドラフト記事はローカルでは表示されるが本番ビルドでは除外される。
```

- [ ] **Step 2: `CLAUDE.md` の Notion 言及を削除**

`CLAUDE.md` の `### 編集の前提` セクション：

```md
- Next.js 14 / TypeScript
- Vercel ホスティング、`npm run build` でビルド
- ブログ記事は `content/blog/<YYYY-MM-DD-slug>/index.md` で管理（Notion 依存は撤去済み）
```

- [ ] **Step 3: Vercel 側環境変数の整理を TODO として記載**

`readme.md` の最終セクションに追記：

```md
## デプロイ環境変数

Vercel ダッシュボードから以下を **削除** すること（移行完了後の手作業）：

- `NOTION_TOKEN`
- `BLOG_INDEX_ID`
- `USE_CACHE`
```

- [ ] **Step 4: コミット**

```bash
git add readme.md CLAUDE.md
git commit -m "[docs] Notion撤去に伴うreadme/CLAUDE.mdの更新"
```

---

## Task 14: 最終検証

- [ ] **Step 1: クリーンビルド**

```bash
rm -rf .next public/blog-assets
unset NOTION_TOKEN BLOG_INDEX_ID USE_CACHE
npm run build
```
Expected: ビルド成功、`public/feed/feed.xml`, `public/sitemap.xml`, `public/blog-assets/` が生成される

- [ ] **Step 2: テスト全件実行**

```bash
npm test
```
Expected: PASS

- [ ] **Step 3: 残存 Notion 参照の最終チェック**

```bash
grep -rn "notion\|NOTION" src/ scripts/ --include="*.ts" --include="*.tsx" || echo "No Notion references found"
```
Expected: 出力なし（または `No Notion references found`）

- [ ] **Step 4: PR 作成準備**

```bash
git log --oneline master..HEAD
```
Expected: 一連のコミットが時系列で表示される

ユーザに PR 作成可否を確認する。

---

## Self-Review (writer による事前確認)

- 各タスクは TDD（先にテスト→失敗→実装→PASS→コミット）の順
- ファイルパスはすべて絶対表記でなくとも `cwd` 起点で明確
- スコープ外の作業（ブランドデザイン刷新等、CLAUDE.md にあるが本タスクでない事項）は含まない
- frontmatter フィールド名は spec と完全一致（`title/slug/date/authors/published/description`）
- 関数名は `getAllPostsMeta` / `getPostBySlug` / `getAllSlugs` で全タスク統一
- Task 7 の build スクリプト変更は Task 11 の RSS/sitemap 切り替え後にのみ機能する点を明示
- Task 12 の依存削除前に、Task 11 までで Notion 参照を切り替え済みである順序になっている
