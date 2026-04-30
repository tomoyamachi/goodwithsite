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
    expect(post).not.toBeNull()
    expect(post!.title).toBe('サンプル記事')
    expect(post!.html).toContain('<h1')
    expect(post!.html).toContain('見出し1')
    expect(post!.html).toContain('<code')
  })

  it('returns null for unknown slug', async () => {
    const post = await getPostBySlug('nonexistent')
    expect(post).toBeNull()
  })

  it('rewrites relative image paths to /blog-assets/<slug>/...', async () => {
    const post = await getPostBySlug('sample-post')
    expect(post!.html).toContain('/blog-assets/sample-post/dummy.png')
    expect(post!.html).not.toContain('./dummy.png')
  })
})
