import styles from './solutions.module.css'
import Title from '../atoms/title'

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
      '社内 LLM や AI サービス利用のガバナンス策定から脆弱性管理まで、設計から実装まで担います。',
  },
]

export default () => (
  <div className={styles.solution}>
    <Title id="solutions">SOLUTIONS</Title>
    <div className={styles.lead}>
      <p>設計・助言で終わらず、実装まで担います。</p>
    </div>
    <div className={styles.services}>
      {services.map(service => (
        <Service key={service.title} {...service} />
      ))}
    </div>
  </div>
)

const Service = ({ title, detail }) => (
  <div className={styles.service}>
    <h4>{title}</h4>
    <p>{detail}</p>
  </div>
)
