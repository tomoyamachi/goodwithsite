# OG画像 + メタタグ刷新 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PR #43 で確定したポジショニング（コンテナ中心軸 + AI補助軸）をメタタグと OG 画像に反映し、ブログ個別ページでは og:title を記事タイトルで上書きできるようにする。

**Architecture:** メタ文言は純粋関数 `buildMetaTags()` として `src/lib/meta.ts` に切り出して vitest でテスト可能にし、`Header` コンポーネントはそれを呼ぶだけにする。OG画像は puppeteer で HTML テンプレートを 1200×630 にレンダリングする生成スクリプト `scripts/generate-og.ts` を新設し、生成済み JPG を `public/og-image.jpg` として手動コミット運用する。

**Tech Stack:** Next.js 14 / TypeScript / vitest / puppeteer (devDependency, 生成時のみ使用) / tsx (既存)

設計書: `docs/superpowers/specs/2026-05-02-og-meta-relaunch-design.md`

---

## ファイル構成

| ファイル | 種別 | 責務 |
|---|---|---|
| `src/lib/meta.ts` | 新規 | `buildMetaTags(props)` 純粋関数。共通メタとブログ個別 og:title の判定 |
| `tests/meta.test.ts` | 新規 | `buildMetaTags()` のユニットテスト |
| `src/components/layout/header.tsx` | 修正 | `ogTitleOverride` プロパティ追加、`buildMetaTags()` の戻り値を出力 |
| `src/pages/blog/[slug].tsx` | 修正 | `Header` に `ogTitleOverride={post.title + ' | GOODWITH'}` を渡す |
| `scripts/generate-og.ts` | 新規 | puppeteer で 1200×630 JPG を生成 |
| `package.json` | 修正 | `puppeteer` を devDependencies に追加、`scripts.og:generate` を追加 |
| `public/og-image.jpg` | 差し替え | 生成スクリプトの出力 |

タスク順序:

1. メタ文言関数の実装（TDD）
2. Header コンポーネントへの組み込み
3. ブログ個別ページの og:title 上書き
4. OG画像生成スクリプトの実装と画像差し替え
5. ビルド検証と最終コミット

---

## Task 1: meta 文言関数を TDD で実装

**Files:**
- Create: `src/lib/meta.ts`
- Create: `tests/meta.test.ts`

このタスクで定義するインターフェース:

```typescript
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

export function buildMetaTags(input?: MetaTagInput): MetaTagValues
```

仕様:
- `input?.ogTitleOverride` が未指定なら共通 og:title を返す
- `input?.ogTitleOverride` が指定されたら `ogTitle` と `twitterTitle` をその値に差し替える（`description` 系と `ogImageUrl` は常に共通）
- 文言は設計書の確定値をそのまま定数として埋め込む

- [ ] **Step 1: 失敗するテストを書く**

`tests/meta.test.ts` を新規作成:

```typescript
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
      // 「Trivy 初期」「AI 利用」「Dockle 作者」のような日英間スペースを禁止
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
```

- [ ] **Step 2: テストを走らせて失敗を確認**

Run: `npm test -- tests/meta.test.ts`
Expected: FAIL（モジュール `../src/lib/meta` が存在しない）

- [ ] **Step 3: 最小実装を書く**

`src/lib/meta.ts` を新規作成:

```typescript
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
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npm test -- tests/meta.test.ts`
Expected: PASS（全11ケース）

- [ ] **Step 5: コミット**

```bash
git add src/lib/meta.ts tests/meta.test.ts
git commit -m "[meta] サイト共通メタタグ値の組み立て関数を追加

ブログ個別ページなどで og:title / twitter:title を上書きできる
buildMetaTags() を純粋関数として切り出し、vitest でテストする。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Header コンポーネントから buildMetaTags を呼ぶ

**Files:**
- Modify: `src/components/layout/header.tsx`

このタスクで `Header` の `<Head>` 内のメタタグを `buildMetaTags()` の戻り値ベースに切り替え、`ogTitleOverride` プロパティを受け取れるようにする。既存の `titlePre` プロパティは維持する（`<title>` タグ用）。

- [ ] **Step 1: header.tsx を修正**

`src/components/layout/header.tsx` の現状:

```typescript
import Link from 'next/link'
import Head from 'next/head'
import ExtLink from '../ext-link'
import { useRouter } from 'next/router'
import styles from '../../styles/header.module.css'

const navItems: { label: string; page?: string; link?: string }[] = [
  { label: 'BLOG', page: '/blog' },
]

const ogImageUrl = 'https://www.goodwith.tech/og-image.jpg'

export default ({ titlePre = '' }) => {
  const { pathname } = useRouter()

  return (
    <header className={styles.header}>
      <Head>
        <title>{`${titlePre ? `${titlePre} |` : ''} GOODWITH`}</title>
        <link rel="shortcut icon" href="/imgs/favicon.ico" />
        <meta
          name="description"
          content="We provide consulting to solve problems and develop products based in IT"
        />
        <meta property="og:site_name" content="Goodwith" />
        <meta property="og:url" content="https://www.goodwith.tech/" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Goodwith - We design DevSecOps on Containers"
        />
        <meta
          name="twitter:title"
          content="Goodwith - We design DevSecOps on Containers"
        />
        <meta
          property="og:description"
          content="We provide consulting to solve problems and develop products based in IT"
        />
        <meta
          name="twitter:description"
          content="We provide consulting to solve problems and develop products based in IT"
        />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:site" content="@goodwithllc" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      ...
    </header>
  )
}
```

修正後の全文:

```typescript
import Link from 'next/link'
import Head from 'next/head'
import ExtLink from '../ext-link'
import { useRouter } from 'next/router'
import styles from '../../styles/header.module.css'
import { buildMetaTags } from '../../lib/meta'

const navItems: { label: string; page?: string; link?: string }[] = [
  { label: 'BLOG', page: '/blog' },
]

interface HeaderProps {
  // ブラウザタブの <title> に前置するテキスト（例: 記事タイトル）
  titlePre?: string
  // og:title / twitter:title を共通値ではなくこの値に差し替える（ブログ記事ページ用）
  ogTitleOverride?: string
}

export default ({ titlePre = '', ogTitleOverride }: HeaderProps) => {
  const { pathname } = useRouter()
  const meta = buildMetaTags({ ogTitleOverride })

  return (
    <header className={styles.header}>
      <Head>
        <title>{`${titlePre ? `${titlePre} |` : ''} GOODWITH`}</title>
        <link rel="shortcut icon" href="/imgs/favicon.ico" />
        <meta name="description" content={meta.description} />
        <meta property="og:site_name" content="Goodwith" />
        <meta property="og:url" content="https://www.goodwith.tech/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={meta.ogTitle} />
        <meta name="twitter:title" content={meta.twitterTitle} />
        <meta property="og:description" content={meta.ogDescription} />
        <meta name="twitter:description" content={meta.twitterDescription} />
        <meta property="og:image" content={meta.ogImageUrl} />
        <meta name="twitter:image" content={meta.ogImageUrl} />
        <meta name="twitter:site" content="@goodwithllc" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className={styles.container}>
        <div className={styles.logo}>
          <a href="/">
            <img src="/big-logo.png" />
          </a>
        </div>
        <div className={styles.navigation}>
          <ul>
            {navItems.map(({ label, page, link }) => (
              <li key={label}>
                {page ? (
                  <Link href={page} className={pathname === page ? 'active' : undefined}>
                    {label}
                  </Link>
                ) : (
                  <ExtLink href={link}>{label}</ExtLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: TypeScript の型チェックが通ることを確認**

Run: `npx tsc --noEmit`
Expected: エラーなし（既存呼び出し `<Header titlePre={post.title} />` は新しい `HeaderProps` の `titlePre?: string` と互換）

- [ ] **Step 3: 既存テストが壊れていないことを確認**

Run: `npm test`
Expected: PASS（meta.test.ts と既存の posts.test.ts / contactMailto.test.ts がすべて通る）

- [ ] **Step 4: コミット**

```bash
git add src/components/layout/header.tsx
git commit -m "[meta] Header を buildMetaTags ベースに置き換え

og:title / twitter:title をブログ個別ページから上書きできるよう
ogTitleOverride プロパティを追加。共通文言は buildMetaTags() に集約。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: ブログ記事ページで og:title を記事タイトルに上書きする

**Files:**
- Modify: `src/pages/blog/[slug].tsx`

- [ ] **Step 1: blog/[slug].tsx を修正**

`src/pages/blog/[slug].tsx` の `Header` 呼び出しを以下に変更する。

変更前:

```typescript
<Header titlePre={post.title} />
```

変更後:

```typescript
<Header titlePre={post.title} ogTitleOverride={`${post.title} | GOODWITH`} />
```

- [ ] **Step 2: 型チェックが通ることを確認**

Run: `npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 3: ビルドが通ることを確認**

Run: `npm run build`
Expected: 成功（ブログページの SSG が走り、各記事ページが生成される）

ビルド出力ログでブログ記事ページが生成されていることを目視確認:

```
○ /blog/[slug] (SSG)
```

- [ ] **Step 4: 生成された HTML を1記事だけ確認**

Run:

```bash
ls .next/server/pages/blog/ | head -5
```

任意の `.html` ファイルがあれば中身に新しい og:title が反映されているか確認:

```bash
grep -h 'og:title' .next/server/pages/blog/*.html | head -3
```

Expected: 各記事の og:title に `<記事タイトル> | GOODWITH` が含まれる

- [ ] **Step 5: コミット**

```bash
git add src/pages/blog/[slug].tsx
git commit -m "[meta] ブログ記事ページで og:title を記事タイトルに上書き

各記事のシェア時に og:title が記事タイトルになるよう
ogTitleOverride を Header に渡す。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: puppeteer を devDependencies に追加

**Files:**
- Modify: `package.json`

OG画像生成のために puppeteer を devDependencies に追加する。本番ビルド・デプロイには影響させない。

- [ ] **Step 1: puppeteer をインストール**

Run:

```bash
npm install --save-dev puppeteer
```

Expected: `package.json` の devDependencies に `puppeteer` が追加され、`package-lock.json` が更新される。

- [ ] **Step 2: package.json に og:generate スクリプトを追加**

`package.json` の `scripts` セクションに以下を追加（`format` の前後どちらでも可）:

```json
"og:generate": "npx tsx scripts/generate-og.ts"
```

修正後の `scripts` 全体例:

```json
"scripts": {
  "dev": "next dev",
  "start": "next start",
  "prebuild": "npx tsx scripts/copy-blog-assets.ts",
  "build": "next build && npx tsx ./src/lib/build-rss.ts && npx tsx ./src/lib/build-sitemap.ts",
  "test": "vitest run",
  "test:watch": "vitest",
  "og:generate": "npx tsx scripts/generate-og.ts",
  "format": "prettier --write \"**/*.{js,jsx,json,ts,tsx,md,mdx,css,html,yml,yaml,scss,sass}\" --ignore-path .gitignore",
  "lint-staged": "lint-staged"
}
```

- [ ] **Step 3: テストとビルドが影響を受けないことを確認**

Run: `npm test`
Expected: PASS

Run: `npm run build`
Expected: 成功

- [ ] **Step 4: コミット**

```bash
git add package.json package-lock.json
git commit -m "[chore] puppeteer を devDependencies に追加

OG画像生成スクリプト用。本番ビルドには影響しない。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: OG画像生成スクリプトを実装

**Files:**
- Create: `scripts/generate-og.ts`

設計書のレイアウト案に沿って HTML/CSS テンプレートを書き、puppeteer で 1200×630 にレンダリングして JPG に保存する。

- [ ] **Step 1: scripts/generate-og.ts を新規作成**

```typescript
/**
 * OG画像（1200×630）を生成して public/og-image.jpg に保存する。
 * 文言は docs/superpowers/specs/2026-05-02-og-meta-relaunch-design.md の確定値を使用。
 * 実行: npm run og:generate
 */
import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'

const OUTPUT = path.join(process.cwd(), 'public', 'og-image.jpg')
const LOGO_PATH = path.join(process.cwd(), 'public', 'big-logo.png')
const WIDTH = 1200
const HEIGHT = 630

// ロゴをbase64で埋め込む（外部ファイル参照を避けてレンダリングを安定化）
function logoDataUri(): string {
  const buf = fs.readFileSync(LOGO_PATH)
  return `data:image/png;base64,${buf.toString('base64')}`
}

function buildHtml(): string {
  const logo = logoDataUri()
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; }
  body {
    font-family: "Hiragino Sans", "Yu Gothic", "Noto Sans JP", system-ui, sans-serif;
    background: #ffffff;
    color: #333333;
    display: flex;
    flex-direction: row;
    align-items: stretch;
  }
  .left {
    width: 40%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #e5e5e5;
  }
  .left img {
    width: 280px;
    height: auto;
  }
  .right {
    width: 60%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 64px;
    position: relative;
  }
  .main-copy {
    font-size: 56px;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: -0.01em;
    color: #1f2937;
  }
  .sub-copy {
    margin-top: 28px;
    font-size: 32px;
    font-weight: 600;
    line-height: 1.4;
    color: #2BA0A8;
  }
  .url {
    position: absolute;
    bottom: 36px;
    right: 64px;
    font-size: 22px;
    font-weight: 500;
    color: #9ca3af;
    letter-spacing: 0.04em;
  }
</style>
</head>
<body>
  <div class="left"><img src="${logo}" alt="GOODWITH" /></div>
  <div class="right">
    <div class="main-copy">コンテナセキュリティを<br />設計から実装まで</div>
    <div class="sub-copy">AI利用のセキュリティもカバー</div>
    <div class="url">goodwith.tech</div>
  </div>
</body>
</html>`
}

async function main() {
  if (!fs.existsSync(LOGO_PATH)) {
    throw new Error(`Logo not found at ${LOGO_PATH}`)
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  })
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 })
    await page.setContent(buildHtml(), { waitUntil: 'networkidle0' })
    await page.screenshot({
      path: OUTPUT,
      type: 'jpeg',
      quality: 90,
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    })
  } finally {
    await browser.close()
  }

  const stat = fs.statSync(OUTPUT)
  console.log(`Generated ${OUTPUT} (${(stat.size / 1024).toFixed(1)} KB)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 2: スクリプトを実行して画像を生成**

Run: `npm run og:generate`
Expected: 標準出力に `Generated /Users/.../public/og-image.jpg (XXX.X KB)` と表示される

- [ ] **Step 3: 生成画像のサイズと寸法を検証**

Run:

```bash
file public/og-image.jpg
ls -la public/og-image.jpg
```

Expected:
- `file` 出力に `JPEG image data` と `1200x630` が含まれる
- ファイルサイズが200KB以下（目安。超えていたら quality を80に下げて再生成）

- [ ] **Step 4: 画像を Read ツールで目視確認**

生成された `public/og-image.jpg` を Read ツールで開き、以下の4要素が含まれていることを確認する:

1. 左ペインに GOODWITH ロゴ
2. メインコピー「コンテナセキュリティを設計から実装まで」
3. 補助コピー「AI利用のセキュリティもカバー」（ティール色）
4. 右下に `goodwith.tech`

レイアウトが崩れていたら CSS を調整して Step 2-4 を繰り返す。

- [ ] **Step 5: コミット**

```bash
git add scripts/generate-og.ts public/og-image.jpg
git commit -m "[og] OG画像生成スクリプトと新OG画像を追加

puppeteer で HTML テンプレートを 1200x630 にレンダリングして
public/og-image.jpg を生成する。コンテナ中心軸+AI補助軸の
両方を読める4要素レイアウト（ロゴ・メイン・補助・URL）。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: 最終ビルド検証

**Files:**
- なし（検証のみ）

- [ ] **Step 1: 全テスト実行**

Run: `npm test`
Expected: 全テスト PASS（meta.test.ts / posts.test.ts / contactMailto.test.ts）

- [ ] **Step 2: 本番ビルド**

Run: `npm run build`
Expected: 成功

- [ ] **Step 3: ビルド出力の HTML に新メタタグが含まれることを確認**

Run:

```bash
grep -h 'og:title\|og:description\|og:image' .next/server/pages/index.html | head -10
```

Expected:
- `og:title` が `GOODWITH — コンテナセキュリティを設計から実装まで | Container & AI Security` を含む
- `og:description` が `Trivy初期コミッタ・Dockle作者によるコンテナ/Kubernetes/クラウドのセキュリティ設計と実装。AI利用のセキュリティもカバー。` を含む
- `og:image` が `https://www.goodwith.tech/og-image.jpg` を含む

- [ ] **Step 4: ブログ記事ページの og:title 確認**

Run:

```bash
ls .next/server/pages/blog/*.html | head -1 | xargs grep 'og:title'
```

Expected: 当該記事のタイトルが og:title に含まれている（例: `<記事タイトル> | GOODWITH`）

- [ ] **Step 5: 開発サーバーで実機確認**

Run（バックグラウンド）: `npm run dev`

ブラウザで `http://localhost:3000/` を開き、DevTools で `<head>` 内の meta タグを確認:

- `<meta name="description" content="Trivy初期コミッタ・..."`
- `<meta property="og:title" content="GOODWITH — コンテナセキュリティを..."`
- `<meta property="og:image" content="https://www.goodwith.tech/og-image.jpg"`

ブログ記事ページ（`http://localhost:3000/blog/<任意のslug>`）でも同様に確認:

- `og:title` が記事タイトルに変わっている
- `og:description` / `og:image` は共通のまま

確認後、開発サーバーを停止。

- [ ] **Step 6: PR作成準備のための git log 確認**

Run: `git log --oneline master..HEAD`
Expected: 5コミット（Task 1-5 で各1コミット）が並ぶ

---

## 完了後の作業

このプランの実装が終わったら、以下を別途実施する（実装外）:

1. ブランチを push して PR を作成
2. PR マージ後、本番デプロイ後に Twitter Card Validator / LinkedIn Post Inspector で OG キャッシュを更新
3. 必要なら設計書の「後続タスクへの引き渡し」に記載した次タスク（ブログ個別 og:description 等）を起票

---

## Self-Review

**1. Spec coverage**

| spec の要素 | 対応タスク |
|---|---|
| meta description 刷新 | Task 1（buildMetaTags）+ Task 2（Header 組み込み）|
| og:title / twitter:title 刷新 | Task 1 + Task 2 |
| og:description / twitter:description 刷新 | Task 1 + Task 2 |
| og:image パス維持・画像差し替え | Task 5 |
| ブログ個別 og:title | Task 1（override 引数）+ Task 3（呼び出し側）|
| OG画像生成スクリプト | Task 5 |
| puppeteer 追加 | Task 4 |
| 表記ルール（日英間スペース禁止）| Task 1 のテストでガード |
| 完了条件: ビルド通過 | Task 6 |
| 完了条件: 1200×630 / 200KB以下 | Task 5 Step 3 |

すべての spec 要素にタスクが対応している。

**2. Placeholder scan**

「TBD」「TODO」「fill in」「適切に」のような曖昧表現は plan 内に存在しない。コード例はすべて完全な形で記述、コマンドも実行可能な形で記載済み。

**3. Type consistency**

- `MetaTagInput` の `ogTitleOverride?: string` は Task 1, 2, 3 で一貫
- `Header` の Props `titlePre?: string` / `ogTitleOverride?: string` も Task 2, 3 で一貫
- `buildMetaTags` の戻り値プロパティ名（`description` / `ogTitle` / `ogDescription` / `twitterTitle` / `twitterDescription` / `ogImageUrl`）は Task 1 のテスト・実装・Task 2 の Header 利用箇所で一致

問題なし。
