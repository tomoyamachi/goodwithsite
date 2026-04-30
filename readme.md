# goodwithsite

GOODWITH LLC（合同会社グッドウィズ）の法人サイト（[goodwith.tech](https://www.goodwith.tech/)）。

## 技術スタック

- Next.js 14 / TypeScript
- 純 SSG（ビルド時に全記事を静的生成）
- ブログ記事は `content/blog/` 配下の Markdown ファイル管理
- Vercel ホスティング

## セットアップ

```sh
npm install
npm run dev
```

開発サーバーは `http://localhost:3000` で起動。

## ビルド

```sh
npm run build
```

`prebuild` で `content/blog/*/` 配下の画像が `public/blog-assets/<slug>/` にコピーされ、本ビルド後に RSS と sitemap.xml が生成される。

## ブログ記事の追加

`content/blog/<YYYY-MM-DD-slug>/index.md` を作成する。ディレクトリ名の日付プレフィックスは時系列ソート用（URL には影響しない）。

frontmatter:

```yaml
---
title: 記事タイトル
slug: my-post
date: 2024-01-15
authors:
  - 天地 知也
published: true
description: 一覧・OG・RSS 用の概要（任意）
---
```

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `title` | string | ◯ | 記事タイトル |
| `slug` | string | ◯ | URL 部分。半角英数とハイフンのみ。全記事で一意 |
| `date` | string (YYYY-MM-DD) | ◯ | 公開日。一覧ソート・RSS の `<updated>` に使用 |
| `authors` | string[] | – | 表示名の配列 |
| `published` | boolean | ◯ | `false` の記事は本番ビルドから除外（ローカルでは表示） |
| `description` | string | – | 一覧・OG・RSS 用概要 |

### 画像

記事と同じフォルダに置く。Markdown 内では `./image.png` のように相対パスで参照する。ビルド時に `/blog-assets/<slug>/image.png` に書き換わる。

```md
![alt text](./screenshot.png)
```

### Markdown 機能

- GFM（テーブル・打ち消し線・タスクリスト）
- 見出しに自動でアンカー ID 付与（`rehype-slug`）
- コードブロック構文ハイライト（`rehype-prism-plus`）

数式・ツイート埋め込みなどの拡張は未対応。必要なら Issue で相談。

## テスト

```sh
npm test
```

## 環境変数

現状、ビルド時・ランタイム共に必須の環境変数はない（Notion 依存は撤去済み）。

### Vercel ダッシュボードのクリーンアップ（移行直後の手作業）

過去の Notion 連携で設定されていた以下を削除すること：

- `NOTION_TOKEN`
- `BLOG_INDEX_ID`
- `USE_CACHE`

## ディレクトリ構成

```
content/blog/<YYYY-MM-DD-slug>/
  index.md          # 記事本文 + frontmatter
  *.png, *.jpg      # 記事内画像
src/
  lib/posts.ts                     # Markdownローダー
  lib/rehype-relative-images.ts    # 画像相対パス書き換えプラグイン
  lib/build-rss.ts                 # RSS生成
  lib/build-sitemap.ts             # sitemap生成
  pages/blog/index.tsx             # 記事一覧
  pages/blog/[slug].tsx            # 記事詳細
scripts/
  copy-blog-assets.ts              # prebuild用画像コピースクリプト
```
