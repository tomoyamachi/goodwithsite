import styles from './works.module.css'
import Title from '../atoms/title'

// 取引先は実名掲載の可否確認が完了するまで業界表記で掲載する
const clients = [
  {
    industry: '自動車業界',
    detail: '大手自動車メーカー、モビリティソリューション事業者へのコンテナセキュリティ実装支援',
  },
  {
    industry: '人材業界',
    detail: '大手求人プラットフォームのインフラセキュリティ整備',
  },
  {
    industry: 'SaaS / カスタマーサポート業界',
    detail: 'SaaS事業者のクラウド・コンテナ環境のセキュリティ設計および運用支援',
  },
]

// 関連プロダクトは PRODUCTS と同形式のカード（スクリーンショット画像 + 役割ラベル + サービス名）
// FutureVuls は画像=サービス公式 (vuls.biz)、リンク=解説記事 (Qiita) という方針
const products = [
  {
    role: '自社プロダクト',
    name: 'Security Issues in Popular Containers',
    detail: '主要なコンテナイメージのセキュリティ実態を分析・公開',
    url: 'https://containers.goodwith.tech/',
    image: '/works/security-issues.png',
  },
  {
    role: '寄稿・貢献',
    name: 'FutureVuls',
    detail: 'Vulsをベースとした脆弱性管理サービスへの貢献（Future Architect株式会社）',
    url: 'https://qiita.com/tomoyamachi/items/ce0c9ecb36f968e3324b',
    image: '/works/futurevuls.png',
  },
]

const ProductCard = ({ url, name, detail, image, role }) => (
  <a
    className={styles.productCard}
    href={url}
    target="_blank"
    rel="noopener noreferrer"
  >
    <span className={styles.role}>{role}</span>
    <div className={styles.productImage}>
      <img src={image} alt={name} loading="lazy" />
    </div>
    <h4>{name}</h4>
    <p>{detail}</p>
  </a>
)

export default () => (
  <div className={styles.works}>
    <Title id="works">WORKS</Title>

    <div className={styles.section}>
      <h3 className={styles.subhead}>主要取引先</h3>
      <p className={styles.note}>
        各社との合意のもと、現時点では業界表記で掲載しています。
      </p>
      <div className={styles.clientGrid}>
        {clients.map(c => (
          <div key={c.industry} className={styles.client}>
            <h4>{c.industry}</h4>
            <p>{c.detail}</p>
          </div>
        ))}
      </div>
    </div>

    <div className={styles.section}>
      <h3 className={styles.subhead}>関連プロダクト</h3>
      <div className={styles.productGrid}>
        {products.map(p => (
          <ProductCard key={p.name} {...p} />
        ))}
      </div>
    </div>
  </div>
)
