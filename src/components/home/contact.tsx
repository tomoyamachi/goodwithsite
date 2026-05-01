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
        <div className={styles.channelCard}>
          <h4>15分相談を予約</h4>
          <p>オンライン15分から、Google Meet 等で対応します（指定可・延長可）</p>
          <a
            href="https://timerex.net/s/tomoya.amachi_2469/e962a2ce"
            className={styles.channelButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            日程を選んで予約 →
          </a>
        </div>

        <div className={styles.channelCard}>
          <h4>メールで連絡</h4>
          <p>件名・本文の雛形が入った状態でメーラーが開きます。社内共有・記録に向きます。</p>
          <a href={buildMailtoLink()} className={styles.channelButton}>
            メールを書く →
          </a>
        </div>

        <div className={styles.channelCard}>
          <h4>X DM で連絡</h4>
          <p>カジュアルなご質問・OSS 文脈のお声がけに</p>
          <a
            href="https://x.com/tomoyamachi"
            className={styles.channelButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            @tomoyamachi へ送る →
          </a>
        </div>
      </div>
    </div>
  </div>
)
