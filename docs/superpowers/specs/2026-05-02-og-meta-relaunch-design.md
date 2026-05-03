# OG画像 + メタタグ刷新

最終更新: 2026-05-02
ステータス: 設計確定、実装プラン未着手

## 目的

PR #43（`27cfcfd`）で確定したサイトのポジショニング（中心軸: コンテナセキュリティを設計から実装まで／補助軸: AI利用のセキュリティもカバー）を、検索結果・SNSシェア時の表示にも反映する。

現状 `src/components/layout/header.tsx` のメタタグと `public/og-image.jpg` は古いポジショニング（`We design DevSecOps on Containers` / `We provide consulting to solve problems...`）のまま放置されており、外部からの第一接触点で本サイトのポジショニングが伝わらない状態にある。

## 背景

リローンチ実装プラン（`docs/plans/2026-04-30-site-relaunch.md`）フェーズ3「OG画像刷新」のスコープを、メタタグ全般とブログ個別 og:title まで拡張して具体化する。

### 現状の課題

1. **メタタグが古い英語表現のまま**
   - `og:title` = `Goodwith - We design DevSecOps on Containers`
   - `og:description` = `We provide consulting to solve problems and develop products based in IT`
   - 国内ターゲット顧客の意思決定者にも「コンサル」表現を本人が好まない方針にも反する
2. **OG画像がロゴのみ**
   - 現状 1200×630 にロゴが中央配置されているだけで、ポジショニングがゼロ伝達
3. **ブログ記事個別ページの og:title が共通固定**
   - 全ブログ記事で同じ og:title が出力されるため、SNSシェア時に記事内容が伝わらない

### 戦略 ADR・先行スペックとの整合

- 戦略 ADR（`asset-plan/work/decisions/2026-04-29-inbound-only-acquisition.md`）の「インバウンド一本での新規顧客獲得」「国内ターゲット顧客」と整合する形で、メタタグ・OG画像を日本語ベースで設計する
- 先行スペック（`docs/superpowers/specs/2026-05-02-ai-security-positioning-design.md`）で確定した「中心軸: コンテナ／補助軸: AI利用のセキュリティ」を踏襲する

## スコープ

### 対象

1. `src/components/layout/header.tsx` のメタタグ刷新（meta description / og:* / twitter:*）
2. `public/og-image.jpg` の差し替え（プレースホルダーをスクリプト生成）
3. ブログ個別ページ（`src/pages/blog/[slug].tsx`）の og:title を記事タイトルで上書き
4. OG画像生成スクリプト（`scripts/generate-og.ts`）の追加

### 対象外

- ブログ記事個別の og:description 出力（記事 frontmatter の `description` が全記事で空のため、別タスクで「ブログ活性化」と一緒に扱う）
- ブログ記事個別の og:image 動的生成（`@vercel/og` 等。実装コスト中で本タスクのスコープを超える）
- OG画像のブランドデザイン仕上げ（本タスクではスクリプト生成のプレースホルダーで暫定対応。後でデザインを差し替える際は同じパス `/og-image.jpg` を上書きする想定）
- Eyecatch / SOLUTIONS 等のサイト本文側の文言変更（PR #43 で完了済み）

## 文言の確定値

### 表記ルール

- 英単語と日本語の間には半角スペースを入れない（例: `Trivy初期コミッタ`、`AI利用`）
- 英単語同士・記号と英単語の間は通常通り半角スペース（例: `| Container & AI Security`）

### メタタグ確定値

| プロパティ | 値 |
|---|---|
| `<title>` | `${titlePre ? titlePre + ' \| ' : ''}GOODWITH`（既存ロジック維持） |
| `meta name="description"` | `Trivy初期コミッタ・Dockle作者によるコンテナ/Kubernetes/クラウドのセキュリティ設計と実装。AI利用のセキュリティもカバー。` |
| `og:site_name` | `Goodwith`（既存維持） |
| `og:url` | `https://www.goodwith.tech/`（既存維持） |
| `og:type` | `website`（既存維持） |
| `og:title`（共通） | `GOODWITH — コンテナセキュリティを設計から実装まで \| Container & AI Security` |
| `og:title`（ブログ個別） | `<記事タイトル> \| GOODWITH` |
| `og:description` | meta description と同文 |
| `og:image` | `https://www.goodwith.tech/og-image.jpg`（パス維持、画像内容を差し替え） |
| `twitter:title` | `og:title` と同一 |
| `twitter:description` | meta description と同文 |
| `twitter:image` | `og:image` と同一 |
| `twitter:site` | `@goodwithllc`（既存維持） |
| `twitter:card` | `summary_large_image`（既存維持） |

### 実装方針: ブログ個別 og:title

`Header` コンポーネントに既存の `titlePre` プロパティに加えて、新たに `ogTitleOverride?: string` を追加する。

- 通常ページ: `ogTitleOverride` 未指定 → 共通 og:title を出力
- ブログ記事ページ（`src/pages/blog/[slug].tsx`）: `ogTitleOverride={post.title + ' | GOODWITH'}` を渡して上書き

`twitter:title` も同じ値を使う（og:title と twitter:title はペアで上書きする）。description / image は全ページ共通のため上書き不要。

## OG画像の設計

### サイズ・形式

- 1200 × 630（Open Graph 推奨）
- 出力フォーマット: JPG（既存の `og-image.jpg` パスを上書き）
- ファイルサイズ目安: 200KB 以下

### 構成要素（4点）

1. **ロゴ**: GW マーク + `GOODWITH` 文字（既存 `public/big-logo.png` または `public/small-logo.png` を流用）
2. **メインコピー**: `コンテナセキュリティを設計から実装まで`
3. **補助コピー**: `AI利用のセキュリティもカバー`
4. **URL**: `goodwith.tech`

### レイアウト

左右分割の2カラム構成。

```
+--------------------------------------------------+
|                                                  |
|   [GW]            コンテナセキュリティを          |
|                   設計から実装まで                |
|   GOODWITH                                       |
|                   AI利用のセキュリティもカバー   |
|                                                  |
|                                       goodwith.tech |
+--------------------------------------------------+
```

- 左ペイン（約 40% 幅）: ロゴを縦中央配置
- 右ペイン（約 60% 幅）:
  - メインコピー（大、太字、ダークグレー `#333`）
  - メインコピー直下に補助コピー（中、ティール系 `#2BA0A8` または濃いめのグレー）
  - 視覚ヒエラルキー: メイン > 補助
- フッター右下: `goodwith.tech`（小、薄いグレー）
- 背景: 白 `#FFFFFF`
- アクセントカラーは既存ロゴのティール（`#2BA0A8` 系）を1箇所のみ使用（補助コピー or 細い区切り線など）

### 生成方法

`scripts/generate-og.ts` を新設し、puppeteer で HTML/CSS テンプレートを 1200×630 にレンダリングして JPG 出力する。

- 依存: `puppeteer` を `devDependencies` に追加（本番ビルドでは使わない）
- 実行コマンド: `npx ts-node scripts/generate-og.ts`（または `npm run og:generate` を `package.json` の scripts に追加）
- 出力先: `public/og-image.jpg`
- フォント: システムデフォルト（Hiragino Sans / Yu Gothic）で十分。Webフォント読み込みはしない（生成環境差を避ける）

スクリプトは「文言を変えたら再生成できる」状態を維持することが目的で、毎ビルドで自動生成はしない（生成済みファイルをコミットする運用）。

## 完了条件

- X / LinkedIn / Slack 等で `https://www.goodwith.tech/` をシェアした際、カードプレビューに新しい og:title / og:description / og:image が表示される
  - キャッシュ更新は Twitter Card Validator・LinkedIn Post Inspector で別途実施（実装外）
- 各ブログ記事ページをシェアした際、og:title に記事タイトルが反映される
- `npm run build` が通る
- 生成された `public/og-image.jpg` が 4要素（ロゴ・メインコピー・補助コピー・URL）を含み、1200×630・200KB以下である
- `scripts/generate-og.ts` を実行すれば誰でも同じ画像を再生成できる

## 影響範囲・非機能要件

- 変更ファイル:
  - `src/components/layout/header.tsx`（プロパティ追加 + メタタグ文言）
  - `src/pages/blog/[slug].tsx`（`ogTitleOverride` を渡す）
  - `public/og-image.jpg`（差し替え）
  - `scripts/generate-og.ts`（新規）
  - `package.json`（`devDependencies` に puppeteer、`scripts` に og:generate 追加）
- 既存の他コンポーネント（home配下、layout配下のheader以外）には影響しない
- SEO 影響: meta description が一新されるため検索結果のスニペットが切り替わる。中心軸（コンテナセキュリティ）が明示されるためポジティブな変化を見込む
- パフォーマンス: 画像差し替えのみでサイズ感は同等。Lighthouse スコアへの影響は無視できる範囲
- アクセシビリティ: og:image の alt は OG プロトコルでは `og:image:alt` で指定可能だが、本タスクでは未追加（必要なら別途）

## 後続タスクへの引き渡し

本タスク完了後に検討する別タスク:

1. **ブログ個別 og:description**: 記事 frontmatter の `description` を9記事分追記する作業と合わせて実装。空ならサイト共通 description にフォールバックさせる
2. **ブログ個別 og:image 動的生成**: `@vercel/og` でブログ記事タイトルを焼いた画像を動的生成
3. **OG画像のブランドデザイン仕上げ**: スクリプト生成のプレースホルダーから、デザイナー手作業の高品質画像へ差し替え（同じパスを上書き）
4. **`og:image:alt` の追加**: SNS 上の代替テキスト
5. **構造化データ（JSON-LD）の追加**: Organization スキーマ等

## 関連ドキュメント

- リローンチ実装プラン: `docs/plans/2026-04-30-site-relaunch.md`（フェーズ3）
- 先行スペック: `docs/superpowers/specs/2026-05-02-ai-security-positioning-design.md`
- 戦略 ADR: `asset-plan/work/decisions/2026-04-29-inbound-only-acquisition.md`
- リポジトリ前提: `CLAUDE.md`

## 判断ログ

### 2026-05-02 og:title は日本語タイトル + 英語サブ併記（B案）を採用

選択肢として A（完全日本語）/ B（日本語タイトル+英語サブ併記）/ C（短縮形）を検討。サイト本体の Eyecatch 文言（日本語メイン+英語サブ併記）と語感を揃えるため B を採用した。日本語と英単語の間に半角スペースは入れない表記ルールを適用する。

### 2026-05-02 OG画像はスクリプト生成のプレースホルダー（B案）を採用

選択肢として A（手動デザイン）/ B（スクリプト生成）/ C（@vercel/og 動的生成）を検討。Trivy初期コミッタは個人実績で会社プロダクトではないため OG では強調しない方針が確定し、また会社のブランド表現として「コンテナ + AI 両軸を併記」の最低要件を満たせば暫定としては十分という判断で、再生成可能な B を採用した。後日デザイン仕上げで上書きできる構造を残す。

### 2026-05-02 OG画像は4要素（ロゴ・メインコピー・補助コピー・URL）に絞る

選択肢として A（ミニマル4要素）/ B（日英併記5要素）/ C（コピー1本に絞る3要素）を検討。PR #43 で「コンテナ + AI 両軸を打ち出す」と決まったため C は不採用。X タイムライン縮小時の視認性を優先して B も外し、両軸併記が最低限読める A を採用した。Trivy/Dockle は OG画像には載せない（会社プロダクトではないため）。

### 2026-05-02 ブログ個別OGは og:title のみ記事タイトル反映（A案）

選択肢として A（og:title のみ） / B（og:title + og:description）/ C（B + 個別画像）/ D（共通のみで個別なし）を検討。frontmatter の `description` が9記事すべて空のため B/C は frontmatter 改修と抱き合わせる必要があり、本タスクのスコープを膨らませる。実装コストが小さく即効性のある A を採用、B/C は「ブログ活性化」フェーズで併せて実施する。
