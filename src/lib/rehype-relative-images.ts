import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root, Element } from 'hast'

type Options = { slug: string }

// Markdown 内の `./xxx.png` 形式の画像参照を /blog-assets/<slug>/xxx.png に書き換える
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
