# 問い合わせ導線の整備 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** TOP の CONTACT セクションに「30分相談予約 / メール / X DM」の3チャネル並列カードを設置し、フォームを置かず気軽な接点を増やす。

**Architecture:** `src/components/home/contact.tsx` の連絡先リストを 3チャネル並列カードに置き換える。mailto URL 構築は純関数 `buildMailtoLink()` として切り出し、単体テストでURLエンコードと結合の正しさを検証する。TimeRex 予約ページと X はリンク方式（外部スクリプト読み込み無し）。

**Tech Stack:** Next.js 14 (pages router) / TypeScript / CSS Modules / vitest

設計書: `docs/superpowers/specs/2026-05-01-contact-channels-design.md`

---

## File Structure

```
src/components/home/
  contact.tsx          (modify) — 3チャネルカードを追加、既存 channels リスト削除
  contact.module.css   (modify) — channelGrid/channelCard/channelButton 追加、未使用 .channels* 削除
  contactMailto.ts     (create) — mailto URL 構築の純関数（テスト容易にするため切り出し）

tests/
  contactMailto.test.ts (create) — buildMailtoLink の単体テスト
```

## Task 一覧

- Task 1: mailto URL 構築の純関数を TDD で実装
- Task 2: 連絡先カードのデータ定義を contact.tsx に追加
- Task 3: 連絡先カード JSX のレンダリングを contact.tsx に追加
- Task 4: contact.module.css に新カードのスタイルを追加
- Task 5: 既存の不要 CSS（.channelsWrap, .channels, .channels li, .channelLabel）を削除
- Task 6: ビルド確認・動作確認・PR 作成

---

### Task 1: mailto URL 構築の純関数を TDD で実装

**Files:**
- Create: `src/components/home/contactMailto.ts`
- Test: `tests/contactMailto.test.ts`

連絡先カードのうち「メールで連絡」ボタンの `href` に使う `mailto:` URL を組み立てる純関数を作る。件名・本文をハードコードし、`encodeURIComponent` で URL エンコードする。

設計書の mailto テンプレ仕様（`docs/superpowers/specs/2026-05-01-contact-channels-design.md` の「mailto テンプレート仕様」節）に従う。

- [ ] **Step 1: 失敗するテストを書く**

`tests/contactMailto.test.ts` を新規作成:

```ts
import { describe, it, expect } from 'vitest'
import { buildMailtoLink } from '../src/components/home/contactMailto'

describe('buildMailtoLink', () => {
  it('mailto: スキームと宛先を含む', () => {
    const url = buildMailtoLink()
    expect(url.startsWith('mailto:info@goodwith.tech?')).toBe(true)
  })

  it('件名に [GOODWITH] プレフィックスを含み URL エンコードされている', () => {
    const url = buildMailtoLink()
    // [ は %5B、] は %5D、空白は %20
    expect(url).toContain('subject=%5BGOODWITH%5D%20%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B')
  })

  it('本文に天地様の宛名と必要項目が含まれる', () => {
    const url = buildMailtoLink()
    const bodyParam = new URL(url).searchParams.get('body')
    expect(bodyParam).not.toBeNull()
    expect(bodyParam).toContain('天地様')
    expect(bodyParam).toContain('(自己紹介・社名)')
    expect(bodyParam).toContain('(ご相談内容)')
    expect(bodyParam).toContain('(対応形態のご希望: 顧問契約 / スポット相談 / プロジェクト参画 / 未定)')
    expect(bodyParam).toContain('守秘契約前提でお話を伺います')
  })

  it('本文の改行が保たれている', () => {
    const url = buildMailtoLink()
    const bodyParam = new URL(url).searchParams.get('body')
    // 宛名と自己紹介の間に空行が入る = 連続する改行2つを含む
    expect(bodyParam).toMatch(/天地様\n\n\(自己紹介・社名\)/)
  })
})
```

- [ ] **Step 2: テスト実行して失敗を確認**

Run: `npx vitest run tests/contactMailto.test.ts`

Expected: FAIL（モジュール `src/components/home/contactMailto` が存在しない）

- [ ] **Step 3: 最小実装を書く**

`src/components/home/contactMailto.ts` を新規作成:

```ts
// 問い合わせメール本文・件名のテンプレート。
// 設計書: docs/superpowers/specs/2026-05-01-contact-channels-design.md
const MAIL_TO = 'info@goodwith.tech'
const SUBJECT = '[GOODWITH] お問い合わせ'
const BODY = [
  '天地様',
  '',
  '(自己紹介・社名)',
  '',
  '(ご相談内容)',
  '',
  '(対応形態のご希望: 顧問契約 / スポット相談 / プロジェクト参画 / 未定)',
  '',
  '----',
  '※ 守秘契約前提でお話を伺います。検討段階のご相談もお気軽にどうぞ。',
].join('\n')

export const buildMailtoLink = (): string => {
  const params = new URLSearchParams({
    subject: SUBJECT,
    body: BODY,
  })
  return `mailto:${MAIL_TO}?${params.toString()}`
}
```

- [ ] **Step 4: テスト実行して成功を確認**

Run: `npx vitest run tests/contactMailto.test.ts`

Expected: PASS（4テスト全て）

注: `URLSearchParams` は空白を `+` に変換する仕様だが、`mailto:` の本文においては多くのメーラーが `+` を空白として正しく解釈する。`%20` でエンコードしたい場合は `encodeURIComponent` で個別に組み立てる方式に変更可能だが、まずテストを通す方を優先。テストが通らない場合は以下に切り替える:

```ts
export const buildMailtoLink = (): string => {
  const subject = encodeURIComponent(SUBJECT)
  const body = encodeURIComponent(BODY)
  return `mailto:${MAIL_TO}?subject=${subject}&body=${body}`
}
```

- [ ] **Step 5: コミット**

```bash
git add src/components/home/contactMailto.ts tests/contactMailto.test.ts
git commit -m "[contact] mailto URL 構築の純関数 buildMailtoLink を追加"
```

---

### Task 2: 連絡先カードのデータ定義を contact.tsx に追加

**Files:**
- Modify: `src/components/home/contact.tsx`

3チャネルカードのデータ配列を追加する。既存の `engagementTypes` と `contacts` 定数はこの段階では維持し、後の Task 3 で `contacts` を削除する。`contactChannels` の `href` には Task 1 で作った `buildMailtoLink()` の結果を使う。

TimeRex の URL は本人発行を待つため、プレースホルダー `https://timerex.net/s/PLACEHOLDER` を使う（PR マージ前に差し替える）。

- [ ] **Step 1: contact.tsx の import 文を更新**

`src/components/home/contact.tsx:1-2` を以下に置き換え:

```tsx
import styles from './contact.module.css'
import Title from '../atoms/title'
import { buildMailtoLink } from './contactMailto'
```

- [ ] **Step 2: contactChannels 定数を engagementTypes の下に追加**

`src/components/home/contact.tsx` の `engagementTypes` 配列定義（19行目の `]` 直後）に以下を追記:

```tsx
// 3チャネル並列の問い合わせ導線。気軽な接点を増やすため等価に並べる
const contactChannels = [
  {
    title: '30分相談を予約',
    detail: 'オンライン30分、Google Meet で対応します',
    cta: '日程を選んで予約',
    href: 'https://timerex.net/s/PLACEHOLDER',
    external: true,
  },
  {
    title: 'メールで連絡',
    detail: '件名・本文テンプレート付き。社内共有・記録に向きます',
    cta: 'メールを書く',
    href: buildMailtoLink(),
    external: false,
  },
  {
    title: 'X DM で連絡',
    detail: 'カジュアルなご質問・OSS 文脈のお声がけに',
    cta: '@tomoyamachi へ送る',
    href: 'https://x.com/tomoyamachi',
    external: true,
  },
]
```

- [ ] **Step 3: TypeScript 型チェック**

Run: `npx tsc --noEmit`

Expected: エラーなし（既存の型定義と整合）

- [ ] **Step 4: コミット**

```bash
git add src/components/home/contact.tsx
git commit -m "[contact] 3チャネル連絡先カードのデータ定義を追加"
```

---

### Task 3: 連絡先カード JSX のレンダリングを contact.tsx に追加

**Files:**
- Modify: `src/components/home/contact.tsx`

既存の `channelsWrap` ブロック（連絡先リスト UI）を、`contactChannels` を map で展開した3カード UI に置き換える。

- [ ] **Step 1: contacts 定数を削除**

`src/components/home/contact.tsx` の元の `contacts` 配列定義（既存20-31行目相当）を削除する。

- [ ] **Step 2: channelsWrap ブロックの JSX を 3チャネルカードに置換**

`src/components/home/contact.tsx` の既存 `<div className={styles.channelsWrap}>` ブロック全体（既存58-68行目相当）を以下に置き換え:

```tsx
    <div className={styles.channelsWrap}>
      <h3 className={styles.subhead}>連絡先</h3>
      <div className={styles.channelGrid}>
        {contactChannels.map(c => (
          <div key={c.title} className={styles.channelCard}>
            <h4>{c.title}</h4>
            <p>{c.detail}</p>
            <a
              href={c.href}
              className={styles.channelButton}
              {...(c.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {c.cta} →
            </a>
          </div>
        ))}
      </div>
    </div>
```

- [ ] **Step 3: TypeScript 型チェックとビルド確認**

Run: `npx tsc --noEmit`

Expected: エラーなし

- [ ] **Step 4: dev サーバーで表示確認（手動）**

Run: `npm run dev`

ブラウザで `http://localhost:3000/#contact` を開き以下を確認:
- 3カードが表示される（CSS が未追加なのでレイアウトは崩れていてOK、要素が出ていることだけ確認）
- 「日程を選んで予約」をクリック → 新規タブで TimeRex プレースホルダURL（404でOK、リンク自体が機能していること）
- 「メールを書く」をクリック → メーラーが起動し、件名 `[GOODWITH] お問い合わせ`、本文に天地様宛のテンプレが入っている
- 「@tomoyamachi へ送る」をクリック → 新規タブで `https://x.com/tomoyamachi` が開く

確認後 dev サーバーを停止（Ctrl+C）。

- [ ] **Step 5: コミット**

```bash
git add src/components/home/contact.tsx
git commit -m "[contact] 連絡先リストを 3チャネル並列カードに置き換え"
```

---

### Task 4: contact.module.css に新カードのスタイルを追加

**Files:**
- Modify: `src/components/home/contact.module.css`

既存 `.engagement` カードのパターンを踏襲し、3チャネルカード用のスタイルを追加する。設計書「レイアウト・スタイル方針」節に対応。

- [ ] **Step 1: channelGrid / channelCard / channelButton スタイルを追加**

`src/components/home/contact.module.css` の最後（`@media (max-width: 600px)` ブロックの直前、既存91行目のあたり）に以下を追記:

```css
.channelGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.channelCard {
  background: #fff;
  padding: 22px 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.channelCard h4 {
  margin: 0 0 10px;
  color: #2096a3;
  color: rgb(32, 150, 163);
  font-weight: bold;
  font-size: 14pt;
}

.channelCard p {
  margin: 0 0 18px;
  font-size: 0.9rem;
  line-height: 1.7;
  flex-grow: 1;
}

.channelButton {
  display: inline-block;
  align-self: flex-start;
  padding: 8px 16px;
  border: 1px solid #2096a3;
  border-radius: 4px;
  color: #2096a3;
  text-decoration: none;
  font-size: 0.9rem;
  transition: 0.2s;
}

.channelButton:hover {
  background: #2096a3;
  color: #fff;
}
```

- [ ] **Step 2: モバイル用メディアクエリを更新**

`src/components/home/contact.module.css` の `@media (max-width: 600px)` ブロックに `.channelGrid` を追加する。既存ブロック:

```css
@media (max-width: 600px) {
  .engagementGrid {
    grid-template-columns: 1fr;
  }
  .channels li {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .channelLabel {
    flex: none;
  }
}
```

を以下に置き換え:

```css
@media (max-width: 600px) {
  .engagementGrid,
  .channelGrid {
    grid-template-columns: 1fr;
  }
}
```

（`.channels li` と `.channelLabel` のモバイル指定は Task 5 で本体ごと削除するため、この時点で消してよい）

- [ ] **Step 3: dev サーバーで表示確認（手動）**

Run: `npm run dev`

ブラウザで `http://localhost:3000/#contact` を開き以下を確認:
- デスクトップ: 3カードが横並び（既存「対応形態 3カード」と視覚的にリズムが揃っている）
- 各カードに見出し・補足文・ボタンが配置されている
- ボタンは枠線あり、hover で背景色が反転する
- DevTools のデバイス エミュレーションで 600px 以下にすると 1カラムに崩れる

確認後 dev サーバーを停止。

- [ ] **Step 4: コミット**

```bash
git add src/components/home/contact.module.css
git commit -m "[contact] 3チャネルカードのスタイルを追加"
```

---

### Task 5: 既存の不要 CSS を削除

**Files:**
- Modify: `src/components/home/contact.module.css`

3チャネルカード化により未使用となった `.channelsWrap` 直下の `ul` 用スタイル（`.channels`, `.channels li`, `.channels li:last-child`, `.channelLabel`）を削除する。`.channelsWrap` 自体は新カードでも引き続き使うため残す。

- [ ] **Step 1: 未使用セレクタを削除**

`src/components/home/contact.module.css` から以下のブロックを削除:

```css
.channels {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.channels li {
  display: flex;
  align-items: center;
  padding: 16px 22px;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
}

.channels li:last-child {
  border-bottom: none;
}

.channelLabel {
  flex: 0 0 130px;
  color: #888;
  font-weight: bold;
  font-size: 0.9rem;
}
```

- [ ] **Step 2: 結果ファイルの確認**

Run: `cat src/components/home/contact.module.css | grep -E "^\.[a-zA-Z]"`

Expected: 出力に `.channels`, `.channelLabel` を**含まない**。`.channelsWrap`, `.channelGrid`, `.channelCard`, `.channelButton` は含まれる。

- [ ] **Step 3: ビルド確認**

Run: `npm run build`

Expected: ビルド成功（エラーや警告なし）

- [ ] **Step 4: コミット**

```bash
git add src/components/home/contact.module.css
git commit -m "[contact] 旧連絡先リスト用の未使用スタイルを削除"
```

---

### Task 6: ビルド確認・動作確認・PR 作成

**Files:** なし（確認とPR操作のみ）

最終チェックと PR 作成。TimeRex の実URLは本人発行を待つため、PR タイトル/本文に明記してマージ前差し替えを促す。

- [ ] **Step 1: 全テスト実行**

Run: `npm test`

Expected: 全テスト PASS（既存の posts.test.ts + 新規の contactMailto.test.ts）

- [ ] **Step 2: 本番ビルド**

Run: `npm run build`

Expected: ビルド成功、警告なし

- [ ] **Step 3: dev サーバーで最終確認**

Run: `npm run dev`

`http://localhost:3000/#contact` を開いて以下を確認:

- [ ] 既存の対応形態 3カード（顧問契約 / スポット相談 / プロジェクト参画）がそのまま表示される
- [ ] 3チャネルカード（30分相談を予約 / メールで連絡 / X DM で連絡）が表示される
- [ ] 30分相談予約ボタンが新規タブで TimeRex プレースホルダURL を開く
- [ ] メールで連絡ボタンが mailto を起動し、件名・本文がプリフィルされている
- [ ] X DM ボタンが新規タブで `https://x.com/tomoyamachi` を開く
- [ ] DevTools 600px 以下で各グリッドが 1カラムに崩れる

確認後 dev サーバー停止。

- [ ] **Step 4: ブランチを push**

Run:
```bash
git push -u origin feat/contact-channels
```

- [ ] **Step 5: PR を作成**

Run:
```bash
gh pr create --title "[contact] 3チャネル並列の問い合わせ導線（予約・メール・X DM）を整備" --body "$(cat <<'EOF'
## Summary

- フォームを置かず「30分相談予約 / メール / X DM」の3チャネルを並列カードで提示
- TimeRex 無料プランによる予約導線（外部リンク方式、自サイトに外部スクリプトを読み込まない）
- mailto 件名・本文プリフィルで「何を書けばいいか分からない」層を救う
- 既存の対応形態 3カードと X DM 導線は維持

設計書: \`docs/superpowers/specs/2026-05-01-contact-channels-design.md\`
リローンチ計画: \`docs/plans/2026-04-30-site-relaunch.md\` フェーズ3 に該当

## ⚠ マージ前 TODO

- [ ] TimeRex 予約ページを発行し、\`src/components/home/contact.tsx\` の \`https://timerex.net/s/PLACEHOLDER\` を実 URL に差し替える
  - イベント: 30分相談、Google Calendar 連携、Google Meet 自動生成
  - カスタム項目: 会社名（必須）/ 役職（任意）/ 相談したい内容（必須）/ 想定する関わり方（任意）

## Test plan

- [ ] \`npm test\` 全 PASS
- [ ] \`npm run build\` 成功
- [ ] dev サーバーで CONTACT セクションの3カード表示確認
- [ ] 30分相談予約ボタンが TimeRex 予約ページを新規タブで開く
- [ ] メールで連絡ボタンが mailto で件名・本文プリフィル付きで起動する
- [ ] X DM ボタンが \`https://x.com/tomoyamachi\` を新規タブで開く
- [ ] モバイル幅（< 600px）で 1カラムに崩れる

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL が出力される。

- [ ] **Step 6: PR URL を控える**

PR URL をユーザに共有する。

---

## Self-Review チェック

**スペック被覆:**

- ✅ 3チャネル並列カード（予約 / メール / X DM）→ Task 2-4
- ✅ TimeRex 外部リンク方式 → Task 2 (`external: true`, `target="_blank"`)
- ✅ mailto テンプレ（件名・本文プリフィル） → Task 1
- ✅ 既存「対応形態 3カード」維持 → Task 2-3 で当該箇所に手を入れない
- ✅ 既存リード文・タイトル維持 → 変更対象に含まれない
- ✅ レイアウト（既存 engagementGrid と同パターン） → Task 4
- ✅ モバイル 1カラム → Task 4 Step 2
- ✅ 未使用 CSS 削除 → Task 5
- ✅ アクセシビリティ（外部リンクに rel/target、`<a>` 要素、`<h4>`） → Task 3
- ✅ ブランチ名 `feat/contact-channels` → 既に切り済み（前段でコミット済み）
- ✅ PR タイトル規約 → Task 6 Step 5

**プレースホルダ・スキャン:** TimeRex URL のプレースホルダは設計書で意図を明示済み、PR本文の TODO に明記。それ以外に「TBD」「実装後」「適切に」等は無し。

**型整合性:** `buildMailtoLink()` は Task 1 で string 返却型として定義、Task 2 で `href` プロパティに代入（型 string で整合）。`contactChannels` 配列の各要素プロパティ（`title`, `detail`, `cta`, `href`, `external`）は Task 2 で宣言、Task 3 で同じプロパティ名で参照。

**ファイル粒度:** 純関数（contactMailto.ts）はテスト容易性のため切り出し、コンポーネント（contact.tsx）と CSS（contact.module.css）はそれぞれ単一責任。
