import { describe, it, expect } from 'vitest'
import { buildMetaTags } from '../src/lib/meta'

describe('buildMetaTags', () => {
  describe('共通ページ（ogTitleOverride 未指定）', () => {
    it('description はコンテナ中心軸+AI補助軸の文言を返す', () => {
      const meta = buildMetaTags()
      expect(meta.description).toBe(
        'Trivy初期コミッタ・Dockle作者によるコンテナ/Kubernetes/クラウドのセキュリティ設計と実装。AI利用のセキュリティもカバー。'
      )
    })

    it('og:title は中心軸+英語サブ併記の共通タイトルを返す', () => {
      const meta = buildMetaTags()
      expect(meta.ogTitle).toBe(
        'GOODWITH — コンテナセキュリティを設計から実装まで | Container & AI Security'
      )
    })

    it('twitter:title は og:title と同一', () => {
      const meta = buildMetaTags()
      expect(meta.twitterTitle).toBe(meta.ogTitle)
    })

    it('og:description / twitter:description は description と同文', () => {
      const meta = buildMetaTags()
      expect(meta.ogDescription).toBe(meta.description)
      expect(meta.twitterDescription).toBe(meta.description)
    })

    it('og:image は本番URLの og-image.jpg を返す', () => {
      const meta = buildMetaTags()
      expect(meta.ogImageUrl).toBe('https://www.goodwith.tech/og-image.jpg')
    })

    it('og:title に日本語と英単語の間の半角スペースを含まない', () => {
      const meta = buildMetaTags()
      expect(meta.description).not.toMatch(/[A-Za-z0-9][ ][぀-ヿ一-鿿]/)
      expect(meta.description).not.toMatch(/[぀-ヿ一-鿿][ ][A-Za-z0-9]/)
    })
  })

  describe('ブログ個別ページ（ogTitleOverride 指定）', () => {
    it('og:title を指定した値で上書きする', () => {
      const meta = buildMetaTags({ ogTitleOverride: '記事タイトルA | GOODWITH' })
      expect(meta.ogTitle).toBe('記事タイトルA | GOODWITH')
    })

    it('twitter:title も同じ値で上書きする', () => {
      const meta = buildMetaTags({ ogTitleOverride: '記事タイトルB | GOODWITH' })
      expect(meta.twitterTitle).toBe('記事タイトルB | GOODWITH')
    })

    it('description / ogImageUrl は共通のまま', () => {
      const overridden = buildMetaTags({ ogTitleOverride: 'X' })
      const common = buildMetaTags()
      expect(overridden.description).toBe(common.description)
      expect(overridden.ogDescription).toBe(common.description)
      expect(overridden.twitterDescription).toBe(common.description)
      expect(overridden.ogImageUrl).toBe(common.ogImageUrl)
    })
  })
})
