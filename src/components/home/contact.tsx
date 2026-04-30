import styles from './contact.module.css'
import Title from '../atoms/title'

// 対応形態を明示し、依頼検討者が自分のニーズに合うか即座に判断できるようにする
const engagementTypes = [
  {
    label: '顧問契約',
    detail: '中長期で技術選定・設計レビュー・組織側のセキュリティ整備を継続的に支援',
  },
  {
    label: 'スポット相談',
    detail: '単発の設計レビュー、技術選定の壁打ち、トレーニング',
  },
  {
    label: 'プロジェクト参画',
    detail: '実装フェーズへのハンズオン参画。設計から実装までを一貫して担う',
  },
]

const contacts = [
  {
    label: 'Email',
    value: 'info@goodwith.tech',
    href: 'mailto:info@goodwith.tech',
  },
  {
    label: 'X (Twitter) DM',
    value: '@tomoyamachi',
    href: 'https://x.com/tomoyamachi',
  },
]

export default () => (
  <div className={styles.contact}>
    <Title id="contact">CONTACT</Title>

    <div className={styles.lead}>
      <p>
        コンテナセキュリティ・クラウドセキュリティに関するご相談を承ります。
      </p>
      <p>
        守秘契約前提でお話を伺いますので、検討段階のご相談もお気軽にどうぞ。
      </p>
    </div>

    <div className={styles.engagementWrap}>
      <h3 className={styles.subhead}>対応形態</h3>
      <div className={styles.engagementGrid}>
        {engagementTypes.map(t => (
          <div key={t.label} className={styles.engagement}>
            <h4>{t.label}</h4>
            <p>{t.detail}</p>
          </div>
        ))}
      </div>
    </div>

    <div className={styles.channelsWrap}>
      <h3 className={styles.subhead}>連絡先</h3>
      <ul className={styles.channels}>
        {contacts.map(c => (
          <li key={c.label}>
            <span className={styles.channelLabel}>{c.label}</span>
            <a href={c.href}>{c.value}</a>
          </li>
        ))}
      </ul>
    </div>
  </div>
)
