# goodwithsite — GOODWITH LLC 法人サイト

最終更新: 2026-04-30

## 概要

GOODWITH LLC（合同会社グッドウィズ）の法人サイト（[goodwith.tech](https://www.goodwith.tech/)）。Next.js 14 + Vercel ホスティング、ブログは Notion をバックエンドとした SSG。

## このリポジトリの位置づけ（戦略上の役割）

**asset-plan リポジトリ（`/Users/t/src/github.com/tomoyamachi/asset-plan`）で確定した「インバウンド一本での新規顧客獲得戦略」の主要な受け皿** として、本サイトを再活性化する。

戦略の詳細は asset-plan 側を参照:
- ADR: `asset-plan/work/decisions/2026-04-29-inbound-only-acquisition.md`
- 設計書: `asset-plan/docs/superpowers/specs/2026-04-29-work-strategy-inbound-design.md`
- 戦略: `asset-plan/work/strategy.md`

## 戦略コンテキスト要約

### 背景

- 2026年9月以降、自動車会社プロジェクト終了で売上6割減見込み
- 補填はインバウンド一本（能動営業せず、12〜24か月の長期戦を許容）
- 中心軸: コンテナ/クラウドネイティブセキュリティ領域での第一想起獲得

### 本人プロフィール（信用源）

- 代表者: 天地 知也 ([@tomoyamachi](https://x.com/tomoyamachi))
- **Trivy 初期コミッタ** + **Dockle 作者**（コンテナセキュリティ OSS の信用源、国内トップクラス）
- CISSP / CKAD / CKA / CKS / AWS・Azure・OCI 各種認定
- 略歴: 広島大学医学部 → 救急病棟 → 起業 → enish（社内年間MVP、新規ゲームPDM）→ GOODWITH LLC 設立

### ポジショニング（暫定文言）

> コンテナセキュリティを設計から実装まで担う

- 「コンサル」という語は本人が好まないため使わない
- 「設計だけ」「助言だけ」ではなく実装まで担えるハイブリッド軸が差別化点

### ターゲット顧客層

- 事業会社の情シス/セキュリティ部門（顧問契約型）
- スタートアップ/SaaS事業者（プロダクトセキュリティ顧問）
- 大企業のクラウド移行/コンテナ化プロジェクト
- 官公庁/規制業種

## 現状の課題（このリポジトリが解くべき問題）

1. **問い合わせ導線がない**: メール（info@goodwith.tech）のみ、フォームなし
2. **SOLUTIONS の説明が抽象的**: 「professional consulting」では何を頼めるか伝わらない
3. **すべて英語**: 国内ターゲット顧客の意思決定者には日本語の方が刺さる
4. **本人の強みが見えない**: Trivy 初期コミッタの言及が PRODUCTS の一項目として埋もれている、CISSP・CISO 経験等が記載なし
5. **取引先実績が記載なし**: 本田技研工業・ヤマハモーターソリューション・ディップ・ジーネクスト等の主要取引先実績は信用調査で効くが現状未掲載
6. **ブログが休眠**: Notion ブログ機能はあるが活用されていない

## 改善方針

asset-plan の Scrapbox `about_GOODWITH` ページに既に書かれている良質な内容（取引先・OSS活動・略歴・資格・登壇履歴・強み）を、ページランクと検索性で勝るこの法人サイトに移植する。

Scrapbox は維持しつつ、**法人サイトを依頼検討者の主要な着地点にする**。

### 取引先実績の扱い

- 契約終了後も記載で問題にならない場合は実績として残す
- 問題になる場合のみ削除
- 各取引先への確認が必要なケースは個別判断（プラン側で詳細）

## 実装プラン

詳細は本リポジトリの `docs/plans/2026-04-30-site-relaunch.md` を参照。

**方針**: ブログ以外は1ページで完結させる。詳細プロフィールも独立ページにせず TOP の PROFILE セクションに集約する。

主要施策の概要:

- **TOP の刷新**: Eyecatch を日本語+英語併記、ポジショニング1行を全面に押し出す
- **PRODUCTS の強化**: Trivy 初期コミッタを明示、Dockle 等の役割を区分表示
- **SOLUTIONS の具体化**: 「コンテナ/K8sセキュリティ」「クラウドセキュリティ」「脆弱性管理プロセス」「OSSツール導入支援」の4軸に分解
- **WORKS（実績）セクション新設**: 主要取引先（暫定は業界表記）・自社プロダクトを掲載
- **PROFILE セクション新設**: 代表の経歴・資格・OSS活動・登壇履歴を TOP に集約
- **CONTACT セクションの強化**: 問い合わせフォーム or 明確なメール導線、対応形態（顧問/スポット/プロジェクト）の明示
- **多言語対応の方針**: 国内顧客向けに日本語ページを主、英語は維持または併記

## このリポジトリでの作業ルール

### 編集の前提

- Next.js 14 / TypeScript
- Vercel ホスティング、`npm run build` でビルド
- ブログは `content/blog/<YYYY-MM-DD-slug>/index.md` のローカル Markdown で管理（Notion 依存は撤去済み）
- 必須の環境変数はなし

### コーディング規約

- macOS 全プロジェクト共通の `~/.claude/CLAUDE.md` に従う
- 日本語コメント推奨、変数名はキャメルケース
- 機密情報はコードに含めない、`.env` のみ（`.env` は `.gitignore` 済み）

### Git運用

- コミットメッセージは「[機能] 概要」形式
- main への直接コミット禁止、PR 経由でマージ

### 改修時の優先順位

1. **問い合わせ導線の整備**（最優先、最小実装でも効果が出る）
2. **コンテンツの充実**（取引先・OSS活動・経歴）
3. **多言語対応**（日本語化または併記）
4. **ブランドデザインの刷新**（必要に応じて）

## 関連リポジトリ・ページ

- 戦略の母艦: `~/src/github.com/tomoyamachi/asset-plan/work/`
- 旧プロフィール（Scrapbox、移植元）: https://scrapbox.io/tomoyamachi/about_GOODWITH
- 個人 GitHub: https://github.com/tomoyamachi
- 法人 GitHub Org: https://github.com/goodwithtech
- X (Twitter): [@tomoyamachi](https://x.com/tomoyamachi), 法人 [@goodwithllc](https://x.com/goodwithllc)
- LinkedIn: [linkedin.com/company/goodwithllc](https://www.linkedin.com/company/goodwithllc)
