# Blog の Notion 依存撤去 — 設計書

最終更新: 2026-05-01
ステータス: ドラフト（実装着手前）

## 背景

`goodwithsite` の `/blog` は現在、Notion 非公式 v3 API（`src/lib/notion/`）からビルド時に記事を取得する SSG 構成。以下の問題を抱える。

- `NOTION_TOKEN` が定期的に失効し、ビルドが落ちる
- Notion 側スキーマ変更（recordMap 形式変更、署名画像 URL の有効期限など）に追随し続ける必要がある
- 非公式 API のため将来的に動作保証なし

記事の更新頻度は低いため、Notion を完全に撤去し **ローカル Markdown ファイルベース** の静的ブログに移行する。

## ゴール

- `/blog` `/blog/[slug]` は `content/blog/<YYYY-MM-DD-slug>/index.md` から純 SSG で生成される
- Notion 関連コード・依存・環境変数は撤去される
- 既存の Notion 上の全記事は Markdown に移行され、URL（slug）が維持される
- RSS (`/feed`) と sitemap.xml は新パイプラインから引き続き生成される

## 非ゴール

- 記事編集 UI / CMS の構築（Markdown を直接編集する）
- プレビュー機能（Notion 時代の preview モードは廃止）
- ISR（純 SSG にする）
- 多言語対応（既存記事の言語維持のみ）
- 数式（katex）の即時サポート（移行記事に存在すれば後追い対応）

## 全体アーキテクチャ

```
[移行フェーズ：1回だけ]
  Notion API ──[scripts/migrate-notion-to-markdown.ts]──▶ content/blog/<YYYY-MM-DD-slug>/
                                                          ├── index.md
                                                          ├── <blockId>.png
                                                          └── ...

[ビルドフェーズ：以後ずっと]
  content/blog/**/index.md ──[gray-matter + remark/rehype]──▶ /blog (Next SSG)
                            └─────────────────────────────▶ public/feed/, public/sitemap.xml
                            └─[scripts/copy-blog-assets.ts]─▶ public/blog-assets/<slug>/
```

## ディレクトリ構成

```
content/
  blog/
    2024-01-15-my-first-post/
      index.md
      <blockId>.png
      <blockId>.jpg
    2024-03-20-another-post/
      index.md
```

- ディレクトリ名 `YYYY-MM-DD-<slug>` でローカルでは時系列ソート可能
- URL は frontmatter の `slug` のみから決定 → `/blog/<slug>`（日付は URL に出ない）
- 同フォルダに記事内画像を同居（記事単位で完結）

## frontmatter 仕様

```yaml
---
title: 記事タイトル
slug: my-first-post
date: 2024-01-15
authors:
  - 天地 知也
published: true
description: 一覧・OG・RSS で使う概要（任意）
---
```

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `title` | string | yes | 記事タイトル |
| `slug` | string | yes | URL 部分。半角英数とハイフンのみ。**全記事で一意**（ビルド時に検証） |
| `date` | string (YYYY-MM-DD) | yes | 公開日。一覧ソート・RSS の `<updated>` に使用 |
| `authors` | string[] | no | 表示名の配列。空配列または省略可 |
| `published` | boolean | yes | `false` の記事は本番ビルドから除外 |
| `description` | string | no | 一覧・OG・RSS 用概要。空なら本文先頭から自動生成（最大 200 文字） |

## レンダリングパイプライン

### 採用するライブラリ（追加）

- `gray-matter` — frontmatter パース
- `remark` / `remark-parse` / `remark-gfm` — Markdown 構文（GFM: テーブル・打ち消し線・タスクリスト等）
- `remark-rehype` — Markdown AST → HTML AST
- `rehype-slug` / `rehype-autolink-headings` — 見出しに ID 付与（既存 `github-slugger` の代替）
- `rehype-prism-plus` — コードブロック構文ハイライト（既存 `prismjs` 直叩きの代替）
- `rehype-stringify` — HTML 文字列化

### 削除する依存

- `react-jsx-parser`
- `prismjs`
- `katex` / `@types/katex`
- `async-sema`
- `uuid`
- `github-slugger`

### 共通ローダー `src/lib/posts.ts`

```ts
export type PostMeta = {
  title: string
  slug: string
  date: string
  authors: string[]
  published: boolean
  description: string
}

export type Post = PostMeta & { html: string }

export function getAllPostsMeta(): PostMeta[]   // 一覧用、本文不要
export function getPostBySlug(slug: string): Post  // 詳細用
export function getAllSlugs(): string[]            // getStaticPaths 用
```

- `content/blog/*/index.md` を glob
- frontmatter 抽出後、`process.env.NODE_ENV === 'production'` の場合 `published: true` のみ返す
- `date` 降順でソート
- ファイル I/O は **ビルド時 Node のみ**。ランタイム DB なし、API ルートなし

## ページ実装

### `src/pages/blog/index.tsx`

```ts
export async function getStaticProps() {
  return { props: { posts: getAllPostsMeta() } }
}
```

- `revalidate` 削除（純 SSG）
- preview モード関連削除

### `src/pages/blog/[slug].tsx`

```ts
export async function getStaticPaths() {
  return { paths: getAllSlugs().map((slug) => ({ params: { slug } })), fallback: false }
}
export async function getStaticProps({ params }) {
  return { props: { post: getPostBySlug(params.slug) } }
}
```

- 本文は `<div dangerouslySetInnerHTML={{ __html: post.html }} />` で描画
- Twitter/Notion 固有ブロック処理を全削除
- `fallback: false`（全記事をビルド時に生成）

### 削除するファイル

- `src/lib/notion/` ディレクトリ全削除
- `src/pages/api/asset.ts`
- `src/pages/api/preview.ts`
- `src/pages/api/preview-post.ts`
- `src/pages/api/clear-preview.ts`
- `src/components/dynamic.tsx`（HTML 直挿しに切り替えるため不要）
- `src/components/code.tsx`（rehype-prism-plus 出力で置換）
- `src/components/equation.tsx`（katex 削除のため）
- `src/components/heading.tsx`（rehype-slug で代替）
- `src/lib/blog-helpers.ts` の `postIsPublished` / `normalizeSlug` は不要になったら削除（`getBlogLink` / `getDateStr` は維持）

### CSS とインポート

- `src/styles/blog.module.css` に `pre code` 用のスタイルを追加（既存の prism スタイルが component 経由から HTML 直挿しに変わるため）
- `_app.tsx` などで `prismjs/themes/*.css` をインポートしている場合は削除し、`rehype-prism-plus` 用テーマ CSS（または自前 CSS）に差し替え
- `katex/dist/katex.css` のインポートも削除

## 画像処理

### 配置と参照

- 画像本体は `content/blog/<dir>/<filename>` に同居
- Markdown 内では相対パス `![alt](./image.png)` で記述
- ビルド時、相対パス参照を `/blog-assets/<slug>/<filename>` に書き換え（自前 rehype プラグイン、約 30 行）
- 画像本体は `scripts/copy-blog-assets.ts` で `public/blog-assets/<slug>/` にコピー

### ビルド統合

`package.json` の `build` スクリプトを以下に変更：

```json
"prebuild": "npx tsx scripts/copy-blog-assets.ts",
"build": "next build && npx tsx src/lib/build-rss.ts && npx tsx src/lib/build-sitemap.ts"
```

- `USE_CACHE` 環境変数は削除（Notion キャッシュ用だったため不要）
- `src/lib/build-rss.ts` と `src/lib/build-sitemap.ts` は **同じパスのまま改修する**（移動はしない）。Notion 依存を抜くだけ
- `lint-staged.config.js` には影響なし（`*.{js,ts,tsx,...}` 全体にかかる prettier は維持）

## RSS / sitemap

`src/lib/build-rss.ts` と `src/lib/build-sitemap.ts` を **同じパスのまま改修**：

- `getBlogIndex` / `getNotionUsers` / `textBlock` への依存を削除
- `getAllPostsMeta()` を呼び、`description` または本文先頭をエントリ内容に使う
- 出力先 (`public/feed/`, `public/sitemap.xml`) は変更なし

## 移行スクリプト `scripts/migrate-notion-to-markdown.ts`

ワンショット実行用。実行コマンド：

```sh
npx tsx scripts/migrate-notion-to-markdown.ts
```

### 処理フロー

1. `getBlogIndex(true)` で全 `postsTable` 取得（既存コード流用）
2. `getNotionUsers([...allAuthorIds])` で著者 ID → 表示名解決
3. 各記事について：
   - frontmatter フィールド抽出（slug / Page → title / Date → date / Authors → authors / Published === 'Yes' → published）
   - `getPageData(post.id)` で本文ブロック取得
   - **ブロック → Markdown 変換**（`scripts/lib/notion-to-md.ts`）
   - 画像ブロックは `getNotionAssetUrls` で署名 URL を取得し、fetch → `content/blog/<dir>/<blockId>.<ext>` に保存
   - `index.md` を `content/blog/<YYYY-MM-DD>-<slug>/index.md` に出力
4. サマリ表示：
   - 成功件数 / 失敗件数
   - TODO コメントが残った記事の一覧（手動修正対象）
   - 画像 DL 失敗件数

### ブロック変換ルール

| Notion ブロック | Markdown |
|---|---|
| `text` | 段落（rich text を `**bold**` `*italic*` `` `code` `` `[text](url)` に変換） |
| `header` | `# ...` |
| `sub_header` | `## ...` |
| `sub_sub_header` | `### ...` |
| `bulleted_list` | `- ...` |
| `numbered_list` | `1. ...` |
| `code` | ` ```lang\n...\n``` ` |
| `quote` | `> ...` |
| `divider` | `---` |
| `image` | `![](./<blockId>.<ext>)`（本体は DL） |
| `callout` | `> <icon> ...`（引用 + 絵文字） |
| `equation` | `$$...$$`（remark-math 未導入時はそのまま残し TODO コメント） |
| `tweet` | `<!-- TODO: tweet <url> -->` |
| `embed` `video` | `<!-- TODO: embed <display_source> -->` |
| 未知 | `<!-- TODO: unknown type "<type>" id=<id> -->` |

### スクリプトの始末

移行成功・出力 commit 後にスクリプト本体および `src/lib/notion/` を一括削除（実装計画の最終ステップ）。

## 環境変数の整理

### 削除

- `NOTION_TOKEN`
- `BLOG_INDEX_ID`
- `USE_CACHE`

### `.env` / Vercel ダッシュボードから削除

実装の最終ステップで `readme.md` の Notion 関連手順も削除。

## ビルド時の検証

新しい `src/lib/posts.ts` のロード時に以下を検証し、違反があればビルドエラーで停止：

- `slug` の重複なし
- `slug` が `/^[a-z0-9-]+$/` にマッチ
- `date` が `YYYY-MM-DD` 形式
- `published: true` の記事に `title`, `slug`, `date` が存在

## 実装順序（概要）

1. 依存追加（gray-matter, remark, rehype 系）
2. `src/lib/posts.ts` 実装 + ダミー記事 1 件で `/blog` 動作確認
3. ページ書き換え（`blog/index.tsx`, `blog/[slug].tsx`）+ ビルド検証
4. 画像処理（`scripts/copy-blog-assets.ts` + 自前 rehype プラグイン）
5. 移行スクリプト実装・実行・出力目視確認
6. RSS / sitemap 差し替え（Notion 依存除去）
7. Notion 関連コード・依存・API ルート・環境変数を一括削除
8. `npm run build` 通過 / `/blog` 表示確認 / RSS・sitemap 検証

詳細は実装計画書（writing-plans で生成）を参照。

## リスクと対応

| リスク | 対応 |
|---|---|
| Notion トークンが移行前に失効 | 移行スクリプトを最優先で実装・実行。失効した場合は再取得（`readme.md` の手順に従う） |
| 既存記事に未対応ブロックが多い | 移行スクリプトは未対応ブロックを TODO コメントとして残す。実行後に目視で件数把握、必要なら個別対応 |
| 画像署名 URL の同時失効 | 移行スクリプトで画像を即 DL してローカル保存。スクリプト一発で完結させる |
| slug 重複・命名規則違反 | ビルド時バリデーションで検出。移行スクリプトも実行時に重複チェック |
| 既存 URL の互換性 | frontmatter の `slug` を Notion の `Slug` プロパティと一致させる。301 リダイレクト不要 |

## 完了基準

- `npm run build` がローカル環境で `NOTION_TOKEN` 無しで成功する
- `/blog` 一覧と全記事ページが表示される
- `public/feed/feed.xml` と `public/sitemap.xml` が新パイプラインから生成される
- `src/lib/notion/` ディレクトリと Notion 関連 API ルートが存在しない
- `package.json` から Notion 関連依存が消えている
