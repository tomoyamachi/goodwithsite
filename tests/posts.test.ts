import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'

// テスト専用の一時記事を実データと別 slug で配置して posts ローダーを検証する
const TEST_DIR = path.join(process.cwd(), 'content', 'blog', '1990-01-01-zztest')
const TEST_FILE = path.join(TEST_DIR, 'index.md')
const TEST_IMG = path.join(TEST_DIR, 'pic.png')

// 1x1 PNG bytes
const PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06,
  0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44,
  0x41, 0x54, 0x78, 0x9c, 0x63, 0xf8, 0xff, 0xff, 0xff, 0x3f, 0x00, 0x05, 0xfe,
  0x02, 0xfe, 0xa3, 0x06, 0xc7, 0x91, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
  0x44, 0xae, 0x42, 0x60, 0x82,
])

const SAMPLE_MD = `---
title: "テスト用記事"
slug: "zztest"
date: "1990-01-01"
authors:
  - 天地 知也
published: true
description: ローダーテスト用
---

# 見出し1

これは本文です。

## 見出し2

\`\`\`ts
const hello = 'world'
\`\`\`

![dummy image](./pic.png)
`

beforeEach(() => {
  fs.mkdirSync(TEST_DIR, { recursive: true })
  fs.writeFileSync(TEST_FILE, SAMPLE_MD)
  fs.writeFileSync(TEST_IMG, PNG_BYTES)
})

afterEach(() => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true })
})

describe('posts loader', () => {
  it('lists all posts metadata including the test post', async () => {
    const { getAllPostsMeta } = await import('../src/lib/posts')
    const posts = getAllPostsMeta()
    const sample = posts.find((p) => p.slug === 'zztest')
    expect(sample).toBeDefined()
    expect(sample!.title).toBe('テスト用記事')
    expect(sample!.date).toBe('1990-01-01')
    expect(sample!.authors).toEqual(['天地 知也'])
    expect(sample!.published).toBe(true)
  })

  it('exposes test slug in getAllSlugs', async () => {
    const { getAllSlugs } = await import('../src/lib/posts')
    const slugs = getAllSlugs()
    expect(slugs).toContain('zztest')
  })

  it('renders post HTML with code highlighting', async () => {
    const { getPostBySlug } = await import('../src/lib/posts')
    const post = await getPostBySlug('zztest')
    expect(post).not.toBeNull()
    expect(post!.html).toContain('<h1')
    expect(post!.html).toContain('見出し1')
    expect(post!.html).toContain('<code')
  })

  it('returns null for unknown slug', async () => {
    const { getPostBySlug } = await import('../src/lib/posts')
    const post = await getPostBySlug('nonexistent-slug-xxx')
    expect(post).toBeNull()
  })

  it('rewrites relative image paths to /blog-assets/<slug>/...', async () => {
    const { getPostBySlug } = await import('../src/lib/posts')
    const post = await getPostBySlug('zztest')
    expect(post!.html).toContain('/blog-assets/zztest/pic.png')
    expect(post!.html).not.toContain('./pic.png')
  })
})
