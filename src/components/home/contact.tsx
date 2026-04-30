import styles from './contact.module.css'
import Title from '../atoms/title'
import { buildMailtoLink } from './contactMailto'

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
  </div>
)
