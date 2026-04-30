/**
 * Notion ブロック → Markdown 変換ロジック。
 * 移行スクリプト専用。テスト容易性のため副作用なし。
 */

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
          lines.push(
            `<!-- TODO: image download failed for ${v.id} src=${src} -->`,
            ''
          )
          todos.push({
            blockId: v.id,
            type: 'image',
            note: `download failed src=${src}`,
          })
        }
        break
      }
      case 'equation': {
        const content = (p.title?.[0]?.[0] ?? '') as string
        lines.push(`<!-- TODO: equation (math support not enabled) -->`)
        lines.push(`$$${content}$$`, '')
        todos.push({
          blockId: v.id,
          type: 'equation',
          note: 'math support not enabled',
        })
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
  }

  return {
    markdown: lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n',
    todos,
  }
}
