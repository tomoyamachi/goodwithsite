// サイト共通のメタタグ値を組み立てる純粋関数。
// 文言の更新はこのファイルの定数を書き換えるのみで完結する。

const COMMON_DESCRIPTION =
  'Trivy初期コミッタ・Dockle作者によるコンテナ/Kubernetes/クラウドのセキュリティ設計と実装。AI利用のセキュリティもカバー。'

const COMMON_OG_TITLE =
  'GOODWITH — コンテナセキュリティを設計から実装まで | Container & AI Security'

const OG_IMAGE_URL = 'https://www.goodwith.tech/og-image.jpg'

export interface MetaTagInput {
  // ブログ記事ページなどで og:title / twitter:title を上書きしたい場合に指定する
  ogTitleOverride?: string
}

export interface MetaTagValues {
  description: string
  ogTitle: string
  ogDescription: string
  twitterTitle: string
  twitterDescription: string
  ogImageUrl: string
}

export function buildMetaTags(input?: MetaTagInput): MetaTagValues {
  const ogTitle = input?.ogTitleOverride ?? COMMON_OG_TITLE
  return {
    description: COMMON_DESCRIPTION,
    ogTitle,
    ogDescription: COMMON_DESCRIPTION,
    twitterTitle: ogTitle,
    twitterDescription: COMMON_DESCRIPTION,
    ogImageUrl: OG_IMAGE_URL,
  }
}
