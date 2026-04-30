# 次セッション用プロンプト（goodwithsite フェーズ1着手）

最終更新: 2026-04-30

次回 Claude Code セッション開始時にコピペして使うプロンプト集。目的は `goodwith.tech` のフェーズ1（最小限の問い合わせ導線整備）を実装すること。

## 使い方

下のセクションのうち、目的に合うものをコピーしてプロンプトとして渡す。

---

## プロンプト1: フェーズ1の実装着手

```
goodwithsite リポジトリで、goodwith.tech のリローンチ実装フェーズ1を着手したい。

対象ディレクトリ:
/Users/t/src/github.com/tomoyamachi/goodwithsite

最初に以下を読み込んで、戦略コンテキストと実装プランを把握してほしい:

1. CLAUDE.md（リポジトリ全体の前提と戦略コンテキスト）
2. docs/plans/2026-04-30-site-relaunch.md（実装プラン本体）

加えて、戦略の母艦（asset-plan リポジトリ）の関連ファイルも参照:

3. ~/src/github.com/tomoyamachi/asset-plan/work/strategy.md（仕事戦略）
4. ~/src/github.com/tomoyamachi/asset-plan/work/decisions/2026-04-29-inbound-only-acquisition.md（戦略 ADR）
5. ~/src/github.com/tomoyamachi/asset-plan/work/reviews/2026-04-30-positioning-and-site-strategy.md（直近の議論記録）

## ブランチ

feat/site-relaunch-plan ブランチに既に CLAUDE.md と実装プランがコミット済み。
このブランチ上でフェーズ1の実装を進める。

## 実施内容（フェーズ1のみ、フェーズ2以降は今回触らない）

実装プラン docs/plans/2026-04-30-site-relaunch.md の「フェーズ1」のチェックリストを順に消化する:

- [ ] Eyecatch のキャッチコピーを日本語+英語併記に変更
  - 現状: We design DevSecOps on Containers
  - 変更後: 「コンテナセキュリティを設計から実装まで」+ 英語サブ「Container Security from design to implementation」
  - 編集対象: src/components/home/eyecatch.tsx, src/components/home/eyecatch.module.css

- [ ] Eyecatch の「MORE」ボタンを「お仕事のご相談」に変更し、新設する CONTACT セクションへリンク
  - 編集対象: src/components/home/eyecatch.tsx

- [ ] CONTACT セクションを新設
  - 配置: TOP ページに新規セクション（src/pages/index.tsx の構成変更）
  - 内容:
    * 対応形態の明示（顧問契約 / スポット相談 / プロジェクト参画）
    * メール: info@goodwith.tech
    * X DM: @tomoyamachi
    * LinkedIn: linkedin.com/company/goodwithllc
    * 「守秘契約前提でお話を伺います」の一文
  - 新規作成: src/components/home/contact.tsx, src/components/home/contact.module.css

- [ ] SOLUTIONS の3項目を4項目に書き換え
  - 現状（3項目）: Consultation / Development / Management
  - 変更後（4項目）:
    1. コンテナ / Kubernetes セキュリティの設計・実装
    2. クラウドセキュリティ（AWS / Azure / GCP / OCI）
    3. 脆弱性管理プロセスの構築（Trivy 等の CI/CD 組み込み、SBOM 運用）
    4. OSS ツール（Trivy / Dockle / Vuls）の導入・カスタマイズ支援
  - 編集対象: src/components/home/solutions.tsx
  - 上部のリード文も日本語化

- [ ] PRODUCTS の Trivy 表記を「INITIAL COMMITTER」として強調
  - 現状: DEVELOPER 役割で Trivy/Vuls がまとめられている
  - 変更後: AUTHOR / INITIAL COMMITTER / COMMITTER の3区分にし、Trivy を中央位置に独立表示
  - 編集対象: src/components/home/products.tsx

## 制約・注意

- ブログ機能（src/pages/blog/, src/lib/, scripts/）は触らない。Notion 連携は維持
- COMPANY セクションは維持（フェーズ2でPROFILE追加時に整理）
- 既存の英語コンテンツを完全に消すのではなく、日本語をメインにしつつ英語は併記または英語版ページ余地を残す方向で
- ローカルビルド確認: npm install && npm run build && npm run dev
- 環境変数 .env が必要（NOTION_TOKEN, BLOG_INDEX_ID）。ない場合はビルドエラーになる可能性あり

## 完了条件

- npm run build が成功する
- npm run dev でローカル起動し、TOP ページで以下が確認できる:
  * 日本語キャッチコピー
  * 「お仕事のご相談」ボタン → CONTACT へスクロール
  * SOLUTIONS が4項目になっている
  * CONTACT セクションが表示される
- コミットメッセージは「[機能] 概要」形式で、複数のセクションは独立コミットに分ける

## やらないこと

- フェーズ2の PROFILE / WORKS / /about ページ作成（次回以降）
- 取引先各社への実名掲載確認（実装プランのフェーズ2で実施）
- ブログ活性化（フェーズ3）
- デザイン全面刷新（必要に応じて別議論）
```

---

## プロンプト2: 部分実装したい場合（Eyecatch のみ等）

```
goodwithsite リポジトリで、TOP ページの Eyecatch だけ先に日本語化したい。

対象ディレクトリ:
/Users/t/src/github.com/tomoyamachi/goodwithsite

最初に CLAUDE.md と docs/plans/2026-04-30-site-relaunch.md を読み込んで、ポジショニング文言の確定状況を把握してほしい。

ブランチ: feat/site-relaunch-plan

実施:
- src/components/home/eyecatch.tsx の H1 を「コンテナセキュリティを設計から実装まで」+ 英語サブ「Container Security from design to implementation」に変更
- 「MORE」ボタンを「お仕事のご相談」に変更（リンク先は #contact、CONTACT セクション未作成なら一旦 #solutions のまま）
- スマホ表示の文字サイズが破綻しないか確認

完了したら npm run build で動作確認、コミット作成（[home] Eyecatch を日本語ポジショニングに刷新）。
```

---

## プロンプト3: 取引先実名掲載の確認支援

```
goodwithsite リポジトリで、フェーズ2の WORKS セクション実装の前準備として、取引先実名掲載の可否を整理したい。

対象ディレクトリ:
/Users/t/src/github.com/tomoyamachi/goodwithsite

最初に以下を読んで現状把握:
- CLAUDE.md（戦略コンテキスト）
- docs/plans/2026-04-30-site-relaunch.md（特に「取引先実名掲載の確認手順」セクション）

掲載候補の取引先（Scrapbox about_GOODWITH より）:
- 本田技研工業株式会社
- ヤマハモーターソリューション株式会社
- ディップ株式会社
- 株式会社ジーネクスト

実施:
1. 各社との契約書 NDA 条項を確認するためのチェックリストを docs/plans/ 配下に作成
2. 業界表記に倒す場合の代替表記案を提示（例: 「自動車業界」「人材業界」）
3. 確認結果の記録テンプレを作成

ファイル名候補: docs/plans/2026-04-30-works-disclosure-check.md
```

---

## プロンプト4: フェーズ2 PROFILE/WORKS セクション実装

フェーズ1完了後に使う。

**方針**: ブログ以外は1ページで完結。詳細プロフィールも独立ページにせず TOP の PROFILE セクションに集約する（`/about` は作らない）。

```
goodwithsite リポジトリで、リローンチ実装フェーズ2に進む。

対象ディレクトリ:
/Users/t/src/github.com/tomoyamachi/goodwithsite

最初に以下を読み込んで、フェーズ1の完成状態と次に何をするか把握してほしい:
1. CLAUDE.md
2. docs/plans/2026-04-30-site-relaunch.md（特にフェーズ2のチェックリスト）

加えて、移植元コンテンツの参照先:
- Scrapbox about_GOODWITH: https://scrapbox.io/tomoyamachi/about_GOODWITH

実施内容（フェーズ2のチェックリストを順に消化）:

1. PROFILE セクションを TOP に新設（src/components/home/profile.tsx）
   - 代表者: 天地 知也
   - 一言: Trivy 初期コミッタ / Dockle 作者
   - 略歴（広島大学医学部 → 救急病棟 → 起業 → enish → GOODWITH LLC）
   - 認定資格バッジ: CISSP, CKAD/CKA/CKS, AWS, Azure, OCI（credly リンク付き）
   - OSS活動・執筆/インタビュー・登壇履歴を集約
   - 外部詳細リンク: Scrapbox `about_GOODWITH`

2. WORKS セクションを TOP に新設（src/components/home/works.tsx）
   - 暫定は業界表記（自動車業界・人材業界・SaaS業界 等）
   - 自社プロダクト: Security Issues in Popular Containers, FutureVuls

完了条件:
- npm run build 成功
- TOP ページに PROFILE/WORKS が追加されている
- 1ページですべて回遊できる
```

---

## このファイルの扱い

- フェーズ1完了後はプロンプト1とプロンプト2の利用を停止（実施完了として該当部分をコメントアウト or 削除）
- フェーズ3まで完了したら本ファイル全体をアーカイブ
