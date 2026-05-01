# AI 利用のセキュリティ補助軸 反映 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eyecatch に「AI 利用のセキュリティもカバー」の補足コピーを追加し、SOLUTIONS を 4 項目構成（コンテナ/K8s → クラウド → 脆弱性管理 → AI 利用、OSSツール削除）に再編する。

**Architecture:** `eyecatch.tsx` に `<p className={styles.headlineNote}>` を追加し、英語サブを書き換え。`solutions.tsx` の `services` 配列から OSS ツール項目を削除し、AI 項目を 4 番目（末尾）に追加。CSS Module に補足行のスタイルを追加。

**Tech Stack:** Next.js 14（pages router）、TypeScript、CSS Modules、vitest（既存テスト層は node 環境のみ。ビュー層は手動検証）

設計書: `docs/superpowers/specs/2026-05-02-ai-security-positioning-design.md`

---

## File Structure

| ファイル | 操作 | 役割 |
|---|---|---|
| `src/components/home/eyecatch.tsx` | 修正 | 補足行 1 行を追加、英語サブを書き換え |
| `src/components/home/eyecatch.module.css` | 修正 | `headlineNote` クラスを追加（PC/中/スマホの 3 ブレークポイント対応） |
| `src/components/home/solutions.tsx` | 修正 | `services` 配列を 4 項目に再編（OSSツール削除、AI 項目追加） |

CSS Module ファイル（`solutions.module.css`）は変更不要。既存の 2 列グリッドレイアウトはそのまま 4 項目で機能する。

テスト戦略: 本リポジトリの vitest は `tests/**/*.test.ts` を node 環境で実行する設定で、React コンポーネントテストは導入されていない（`contactMailto.test.ts` 等のロジック層のみ対象）。本タスクの変更はビュー層の文字列・レイアウトのみで、ロジックを伴わないため、検証は **`npm run dev` でのブラウザ確認 + `npm run build` でのビルド成功確認** を採用する。

---

## Task 1: SOLUTIONS の 4 項目化

**Files:**
- Modify: `src/components/home/solutions.tsx`

- [ ] **Step 1: 現状の `services` 配列を確認**

`src/components/home/solutions.tsx` を開き、現状の `services` 配列が以下 4 項目であることを確認する。

期待される現状（4 項目）:
1. コンテナ / Kubernetes セキュリティ
2. クラウドセキュリティ
3. 脆弱性管理プロセスの構築
4. OSS ツール導入・カスタマイズ支援

実装は OSS ツール項目を削除し、新規 AI 項目を末尾に追加する（4 項目を 4 項目に置き換え）。

- [ ] **Step 2: `services` 配列を書き換える**

`src/components/home/solutions.tsx` の `services` 配列全体を以下に置き換える:

```tsx
// 対応領域: コンテナセキュリティを軸に、隣接領域までカバーすることを明示する4項目
const services = [
  {
    title: 'コンテナ / Kubernetes セキュリティ',
    detail:
      'イメージ脆弱性管理、クラスタのセキュリティ設計、ランタイム保護まで、設計から実装・運用を担います。',
  },
  {
    title: 'クラウドセキュリティ',
    detail:
      'AWS / Azure / GCP / OCI を対象に、IAM 設計、ガードレール構築、脆弱性検査の自動化を実装します。',
  },
  {
    title: '脆弱性管理プロセスの構築',
    detail:
      'Trivy 等のスキャナを CI/CD に組み込み、SBOM 運用や脆弱性トリアージのフローを設計します。',
  },
  {
    title: 'AI 利用のセキュリティ設計・実装',
    detail:
      '社内 LLM 導入や AI サービス利用に伴うガバナンス策定から、AI 基盤の脆弱性管理・サプライチェーン保護まで、設計から実装まで担います。',
  },
]
```

変更点:
- 既存の「OSS ツール導入・カスタマイズ支援」項目を削除
- 末尾に「AI 利用のセキュリティ設計・実装」を新規追加
- 1〜3 項目目はテキスト無変更
- リード文（`<p>設計・助言で終わらず、実装まで担います。</p>`）は維持

- [ ] **Step 3: 型エラー・lint を確認**

Run: `npx tsc --noEmit`
Expected: 型エラーなし（exit code 0）

- [ ] **Step 4: dev サーバーで表示確認**

Run: `npm run dev`
ブラウザで `http://localhost:3000/` を開き、SOLUTIONS セクションを確認する。

確認項目:
- 4 項目が 2x2 グリッドで表示されている（PC 幅）
- 4 項目目のタイトルが「AI 利用のセキュリティ設計・実装」
- 4 項目目の説明文が設計書の通りであること
- スマホ幅（DevTools で 375px 程度）で 1 列表示になり崩れていない

確認完了後、Ctrl+C で dev サーバーを停止する。

- [ ] **Step 5: コミット**

```bash
git add src/components/home/solutions.tsx
git commit -m "[site] SOLUTIONS にAI利用のセキュリティを追加し4項目構成に整理"
```

---

## Task 2: Eyecatch に補足コピー追加と英語サブ書き換え

**Files:**
- Modify: `src/components/home/eyecatch.tsx`
- Modify: `src/components/home/eyecatch.module.css`

- [ ] **Step 1: `eyecatch.tsx` に補足行を追加**

`src/components/home/eyecatch.tsx` の `<h1>` と `<p className={styles.subHeadline}>` の間に補足行を挿入する。同時に英語サブの文言を書き換える。

変更前（10〜13 行）:
```tsx
        <h1 className={styles.headline}>
          <span className={styles.headlineLine}>コンテナセキュリティを</span>
          <span className={styles.headlineLine}>設計から実装まで</span>
        </h1>
        <p className={styles.subHeadline}>Container Security from design to implementation</p>
```

変更後:
```tsx
        <h1 className={styles.headline}>
          <span className={styles.headlineLine}>コンテナセキュリティを</span>
          <span className={styles.headlineLine}>設計から実装まで</span>
        </h1>
        <p className={styles.headlineNote}>AI 利用のセキュリティもカバー</p>
        <p className={styles.subHeadline}>Container & AI Security from design to implementation</p>
```

変更点:
- 補足行 `<p className={styles.headlineNote}>AI 利用のセキュリティもカバー</p>` を新規追加（H1 直下、英語サブの上）
- 英語サブの文言: `Container Security from design to implementation` → `Container & AI Security from design to implementation`
- ファイル冒頭のコメント（`// ファーストビュー: 日本語キャッチコピーを2行に明示分割し、英語サブを併記`）は内容に合わせて更新する。

コメント更新（5 行目）:
```tsx
// ファーストビュー: 日本語キャッチコピー2行 + 補足1行 + 英語サブを併記
```

- [ ] **Step 2: `eyecatch.module.css` に `headlineNote` スタイルを追加**

`src/components/home/eyecatch.module.css` を編集する。`/* 英語サブ */` の `.subHeadline` ブロックの**直前**に、補足行のスタイルを追加する。

`.subHeadline` の前に挿入する内容:

```css
/* 補足: 日本語メインの直下に置く中サイズの補足コピー */
.headlineNote {
  font-size: 14pt;
  color: #555;
  margin: 0 0 14px;
  text-align: center;
  font-weight: 500;
}
```

サイズ根拠: メイン 26pt > 補足 14pt > 英語サブ 12pt の階層を作る。

次にスマホ用ブレークポイントにも追加する。`@media (max-width: 600px)` ブロック内（`.headline` の `font-size: 18pt` 設定の直後）に以下を追加:

```css
  .headlineNote {
    font-size: 12pt;
    margin-bottom: 8px;
  }
```

中型ブレークポイント `@media (max-width: 1024px)` には追加不要（PC 幅のサイズで違和感なく表示される）。

最終的な `eyecatch.module.css` の構造:

```css
/* （既存の .media, .content） */

/* 日本語キャッチコピー */
.headline { ... }
.headlineLine { ... }

/* 補足: 日本語メインの直下に置く中サイズの補足コピー */
.headlineNote {
  font-size: 14pt;
  color: #555;
  margin: 0 0 14px;
  text-align: center;
  font-weight: 500;
}

/* 英語サブ */
.subHeadline { ... }

/* （既存の .body, .image） */

@media (max-width: 1024px) {
  .headline { font-size: 22pt; }
}

@media (max-width: 600px) {
  .content { ... }
  .headline {
    font-size: 18pt;
    margin-bottom: 10px;
  }
  .headlineNote {
    font-size: 12pt;
    margin-bottom: 8px;
  }
  .subHeadline { ... }
  .body { ... }
  .image img { ... }
}
```

- [ ] **Step 3: 型エラー・lint を確認**

Run: `npx tsc --noEmit`
Expected: 型エラーなし（exit code 0）

- [ ] **Step 4: dev サーバーで表示確認**

Run: `npm run dev`
ブラウザで `http://localhost:3000/` を開き、Eyecatch セクション（ファーストビュー）を確認する。

確認項目（PC 幅）:
- メインコピーが 2 行で「コンテナセキュリティを」「設計から実装まで」（変更なし）
- メイン直下に「AI 利用のセキュリティもカバー」の補足行が中サイズで表示されている
- 補足行の下に英語サブ `Container & AI Security from design to implementation` が表示されている
- ボタン「お仕事のご相談」の位置は変わらず、レイアウトが崩れていない
- 視覚ヒエラルキー: メイン（最大）> 補足（中）> 英語サブ（小）

確認項目（スマホ幅、DevTools で 375px）:
- 3 行（メイン 2 行は引き続き 2 行表示）+ 補足 1 行 + 英語サブ 1 行が縦に整列
- どの行も画面幅をはみ出していない
- ボタンが画面内に収まっている

確認完了後、Ctrl+C で dev サーバーを停止する。

- [ ] **Step 5: コミット**

```bash
git add src/components/home/eyecatch.tsx src/components/home/eyecatch.module.css
git commit -m "[site] Eyecatch に AI 利用セキュリティの補足コピーを追加"
```

---

## Task 3: ビルド成功確認と完了確認

**Files:** （なし、検証のみ）

- [ ] **Step 1: production ビルドを実行**

Run: `npm run build`
Expected:
- ビルド成功（exit code 0）
- 警告・エラーなし
- `next build` の後に `build-rss.ts`, `build-sitemap.ts` も成功する

ビルドが失敗した場合は、ログのエラー内容を確認して該当タスクに戻る。

- [ ] **Step 2: 設計書の完了条件チェック**

設計書（`docs/superpowers/specs/2026-05-02-ai-security-positioning-design.md`）の「完了条件」セクションを確認:

- [x] X / GitHub プロフィールから着地した訪問者が、ファーストビューで「コンテナ + AI 両領域に対応できる人」と認識できる
   - → Eyecatch に「AI 利用のセキュリティもカバー」が追加され、英語サブも `Container & AI Security` で両領域を明示
- [x] SOLUTIONS で AI 利用のセキュリティが「設計から実装まで」担える領域として明示されている
   - → 4 項目目「AI 利用のセキュリティ設計・実装」、説明文末尾「設計から実装まで担います」
- [x] 戦略 ADR の中心軸（コンテナセキュリティ第一想起獲得）と矛盾しない構造になっている
   - → メインコピーは変更なし、SOLUTIONS の AI 項目は 4 番目（末尾）配置
- [x] スマホ・PC 両方で Eyecatch のレイアウトが崩れていない
   - → Task 2 Step 4 で確認済み

- [ ] **Step 3: PR 用の最終確認**

Run: `git log --oneline master..HEAD`
Expected: 2 件のコミット
- `[site] Eyecatch に AI 利用セキュリティの補足コピーを追加`
- `[site] SOLUTIONS にAI利用のセキュリティを追加し4項目構成に整理`

Run: `git diff master..HEAD --stat`
Expected: 3 ファイル変更
- `src/components/home/eyecatch.tsx`
- `src/components/home/eyecatch.module.css`
- `src/components/home/solutions.tsx`

- [ ] **Step 4: PR 作成（ユーザー判断）**

このリポジトリの運用ルール（`CLAUDE.md`）では main への直接コミット禁止、PR 経由でマージ。本プランの作業ブランチは `spec/ai-security-positioning`（設計書コミットの際に作成済み）。

実装後の PR 作成はユーザー判断とする。実装完了の報告とともに PR 作成を提案する。

---

## まとめ

- 全 3 タスク、コミット 2 件（設計書コミットを除く実装分）
- 既存テストへの影響: なし（変更箇所はビュー層の文字列・レイアウトのみ、ロジック層 vitest テストとは独立）
- 検証手段: `npm run dev` でのブラウザ確認 + `npm run build` でのビルド成功確認
- 後続タスク: OG 画像 + メタタグ刷新（本プラン完了後、別ブランチ・別 PR で実施）
