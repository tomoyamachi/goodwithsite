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
    detail: 'SaaS 事業者のクラウド・コンテナ環境のセキュリティ設計および運用支援',
  },
]

const products = [
  {
    name: 'Security Issues in Popular Containers',
    detail: '主要なコンテナイメージのセキュリティ実態を分析・公開する自社プロダクト',
    url: null,
  },
  {
    name: 'FutureVuls',
    detail: 'Vuls をベースとした脆弱性管理サービスへの貢献（Future Architect 株式会社）',
    url: 'https://vuls.biz/',
  },
]

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
      <ul className={styles.productList}>
        {products.map(p => (
          <li key={p.name}>
            {p.url ? (
              <a href={p.url} target="_blank" rel="noopener noreferrer">
                <strong>{p.name}</strong>
              </a>
            ) : (
              <strong>{p.name}</strong>
            )}
            <span className={styles.productDetail}>{p.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
)
