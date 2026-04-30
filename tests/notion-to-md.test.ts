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
    expect(
      richTextToInline([['Anthropic', [['a', 'https://anthropic.com']]]])
    ).toBe('[Anthropic](https://anthropic.com)')
  })

  it('multiple chunks', () => {
    expect(richTextToInline([['hello, '], ['world', [['b']]]])).toBe(
      'hello, **world**'
    )
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
      {
        value: { id: 'b2', type: 'sub_header', properties: { title: [['H2']] } },
      },
      {
        value: {
          id: 'b3',
          type: 'sub_sub_header',
          properties: { title: [['H3']] },
        },
      },
    ]
    const md = blocksToMarkdown(blocks, {}).markdown
    expect(md).toContain('# H1')
    expect(md).toContain('## H2')
    expect(md).toContain('### H3')
  })

  it('renders bulleted_list', () => {
    const blocks = [
      {
        value: {
          id: 'b1',
          type: 'bulleted_list',
          properties: { title: [['item1']] },
        },
      },
      {
        value: {
          id: 'b2',
          type: 'bulleted_list',
          properties: { title: [['item2']] },
        },
      },
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
      {
        value: {
          id: 'b1',
          type: 'quote',
          properties: { title: [['quoted text']] },
        },
      },
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
