# goodwith.tech リローンチ実装プラン

最終更新: 2026-04-30
ステータス: 設計確定、実装未着手

## 目的

asset-plan リポジトリで確定した「インバウンド一本での新規顧客獲得戦略」（`asset-plan/work/decisions/2026-04-29-inbound-only-acquisition.md`）の主要な受け皿として、本サイトを再活性化する。

Scrapbox `about_GOODWITH` の良質なコンテンツ（取引先・OSS活動・略歴・資格・登壇履歴）を本サイトに移植し、依頼検討者の主要な着地点にする。

## 成功条件

- X プロフィール / GitHub プロフィール / dockle README からのリンク先として、相談検討者が「この人に頼める」と判断できるサイトになっている
- 問い合わせ導線が明確で、メール or フォーム経由で連絡が取れる
- 「Trivy 初期コミッタ」「Dockle 作者」「CISSP」「主要取引先」が一目でわかる
- 国内顧客向けに日本語で読める

## 全体方針

### ポジショニング（中心軸）

> コンテナセキュリティを設計から実装まで担う

- 「コンサル」という語は使わない（本人の好みに反する）
- 設計だけ・助言だけではないハイブリッド軸が差別化点

### サイト構造（TOP ページ）

**方針**: ブログ以外は1ページで完結させる。詳細プロフィールも独立ページ（旧 `/about` 案）にせず、TOP の PROFILE セクションに統合する。

```
1. Eyecatch（ファーストビュー）
   - キャッチコピー: 「コンテナセキュリティを設計から実装まで」
   - サブ英文: Container Security from design to implementation
   - 主要 CTA: 「お仕事のご相談」ボタン → CONTACT セクションへ

2. PRODUCTS（OSS 活動）
   - AUTHOR: Dockle, Dockertags
   - INITIAL COMMITTER: Trivy（強調）
   - COMMITTER: Vuls

3. PROFILE（代表者プロフィール）★新設
   - 代表者: 天地 知也
   - 一言: Trivy 初期コミッタ / Dockle 作者
   - 認定資格バッジ（CISSP, CKAD/CKA/CKS, Linux, AWS, Azure, OCI）: 画像はサイト内 `public/certifications/` に保存し、credly 等の検証ページにリンク
   - 登壇・執筆履歴（Scrapbox `about_GOODWITH` の主要項目を移植）
   - 外部リンク: X, GitHub, Scrapbox（詳細はこちら）

   ※ 略歴は当初案にあったが、Scrapbox 側で参照可能なため掲載しない（外部リンクで誘導）
   ※ OSS 活動は PRODUCTS と内容が重複するため PROFILE には含めない

4. SOLUTIONS（対応領域）
   - コンテナ / Kubernetes セキュリティの設計・実装
   - クラウドセキュリティ（AWS / Azure / GCP / OCI）
   - 脆弱性管理プロセスの構築（Trivy 等の CI/CD 組み込み、SBOM 運用）
   - OSS ツール（Trivy / Dockle / Vuls）の導入・カスタマイズ支援

5. WORKS（実績） ★新設
   - 主要取引先（暫定は業界表記、実名掲載は各社確認後）: 自動車業界・人材業界・SaaS業界 等
   - 自社プロダクト: Security Issues in Popular Containers, FutureVuls

6. CONTACT（お仕事のご相談） ★強化
   - 対応形態（顧問 / スポット / プロジェクト）
   - 守秘契約前提のメッセージ
   - 連絡先: メール、X DM、LinkedIn
   - 問い合わせフォーム（任意、第三段階で実装）

7. COMPANY（既存維持）
   - 会社情報、対応技術スタック
```

### 別ページ

- `/blog` (既存、Notion 連携、活性化は別議論)

※ 当初案にあった `/about` は廃止。詳細プロフィールは TOP の PROFILE セクションに集約する。

## 実装フェーズ

### フェーズ1: 最小限の問い合わせ導線整備（最優先・1〜2日）

戦略の核（インバウンド導線）を最短で立てる。デザイン刷新やコンテンツ充実は後回し。

- [ ] Eyecatch の H1 を日本語+英語併記に変更（`We design DevSecOps on Containers` → 「コンテナセキュリティを設計から実装まで」+ 英語サブ）
- [ ] Eyecatch の「MORE」ボタンを「お仕事のご相談」に変更し、CONTACT セクションへリンク
- [ ] CONTACT セクションを新設（または Footer の連絡先を強化）
  - 対応形態の明示
  - メール（info@goodwith.tech）の明示
  - X DM・LinkedIn へのリンク
  - 「守秘契約前提でお話を伺います」の一文
- [ ] SOLUTIONS の3項目（Consultation/Development/Management）を、4項目（コンテナK8s / クラウド / 脆弱性管理 / OSSツール）に書き換え
- [ ] PRODUCTS の Trivy 表記を「INITIAL COMMITTER」として強調

**完了基準**: X プロフィール・GitHub から goodwith.tech にリンクを貼った時、訪問者が「この人にコンテナセキュリティの相談ができる」と即座に理解できる状態。

### フェーズ2: コンテンツ充実（中期、1〜2週間）

依頼検討者の不安を解消する材料を揃える。

- [ ] PROFILE セクションを TOP に新設
  - 代表者プロフィール（天地 知也、Trivy 初期コミッタ / Dockle 作者）
  - 認定資格バッジ: Scrapbox 同様にサムネイル+検証リンクで一覧表示
    - 画像は `public/certifications/` に保存して使う（外部 hotlink しない）
    - リンク先は credly / catalog-education / その他検証ページ
  - OSS活動（dockle, dockertags, Vuls, Trivy の役割と説明）
  - 執筆/インタビュー（Software Design 11月号、Trivy買収裏話 等）
  - 登壇履歴（envoycon 2020、JAWS-UG、Go Conference、AVTOKYO 等）
  - 外部詳細リンク: Scrapbox `about_GOODWITH`、X、GitHub
- [ ] WORKS セクションを TOP に新設
  - 暫定は業界表記で掲載（自動車業界・人材業界・SaaS業界 等）
  - 取引先実名掲載の可否は各社確認後にプラン側で判断
  - 自社プロダクト: Security Issues in Popular Containers, FutureVuls

**完了基準**: 信用調査で十分な情報が取れる、Scrapbox を見にいかなくても主要情報が把握できる状態。

### フェーズ3: 仕上げ（任意、余力ベース）

- [ ] 問い合わせフォームの実装（メール直接連絡で十分なら省略可）
- [ ] OG画像の刷新（現状は古いもの）
- [ ] ブログ活性化（別議論、戦略上の優先度は低いがインバウンド導線として機能する）
- [ ] 多言語対応の体系化（日本語版 `/ja`、英語版 `/`、もしくは併記方式）

## 技術メモ

### 既存の構成

- Next.js 14（pages router）
- TypeScript
- CSS Modules
- Notion ブログ連携（`scripts/`, `src/lib/`, `src/pages/blog/`）
- Vercel ホスティング
- ビルド時に RSS / sitemap を生成

### 編集対象ファイル

- `src/components/home/eyecatch.tsx` - キャッチコピー
- `src/components/home/products.tsx` - PRODUCTS（OSS）
- `src/components/home/solutions.tsx` - SOLUTIONS（対応領域）
- `src/components/home/company.tsx` - COMPANY（会社情報）
- `src/components/layout/footer.tsx` - フッター（連絡先）
- `src/pages/index.tsx` - TOP の構成

### 新規作成ファイル

- `src/components/home/profile.tsx` - PROFILE セクション（詳細プロフィール集約）
- `src/components/home/works.tsx` - WORKS セクション
- `src/components/home/contact.tsx` - CONTACT セクション

※ 当初案にあった `src/pages/about.tsx` は廃止（PROFILE セクションに集約）

### 取引先実名掲載の確認手順

各社へのアプローチは以下のいずれかで実施:

1. 担当者経由で口頭確認、回答をメモに残す
2. 契約書の秘密保持条項を再確認、契約終了後の実績掲載に関する記述を確認
3. 不明な場合は業界表記に倒す（例: 「自動車業界向けセキュリティ実装」）

確認結果は本ファイルの「実装中の判断ログ」セクションに追記する。

## 実装中の判断ログ

（実装着手後、判断を要する論点が出た時点で追記）

## 完了確認チェックリスト

実装完了時、以下を確認:

- [ ] Lighthouse スコア（Performance / Accessibility / SEO）が現状以上
- [ ] スマホ表示で問い合わせ導線が崩れていない
- [ ] X / GitHub から goodwith.tech にリンクして訪問テスト → 「相談したい」と思える内容になっているか自己評価
- [ ] info@goodwith.tech のメール到達確認
- [ ] OG画像が新しいキャッチコピーと整合している
- [ ] 主要取引先の掲載可否確認が完了している（または業界表記に倒す決定がされている）

## 関連ドキュメント

### このリポジトリ内

- `CLAUDE.md` - リポジトリ全体の前提と戦略コンテキスト
- `readme.md` - Notion トークン管理等の運用手順

### 戦略の母艦（asset-plan リポジトリ）

- `asset-plan/work/decisions/2026-04-29-inbound-only-acquisition.md` - 戦略 ADR
- `asset-plan/work/strategy.md` - 仕事戦略
- `asset-plan/docs/superpowers/specs/2026-04-29-work-strategy-inbound-design.md` - 戦略設計書

### 移植元コンテンツ

- Scrapbox `about_GOODWITH`: https://scrapbox.io/tomoyamachi/about_GOODWITH
