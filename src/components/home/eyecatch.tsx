import styles from './eyecatch.module.css'
import Button from '../atoms/button'

// ファーストビュー: 日本語キャッチコピー2行 + 補足1行 + 英語サブを併記
export default () => {
  return (
    <div className={styles.media}>
      <div className={styles.content}>
        <h1 className={styles.headline}>
          <span className={styles.headlineLine}>コンテナセキュリティを</span>
          <span className={styles.headlineLine}>設計から実装まで</span>
        </h1>
        <p className={styles.headlineNote}>AI 利用のセキュリティもカバー</p>
        <p className={styles.subHeadline}>Container & AI Security from design to implementation</p>
        <div className={styles.body}>
          <Button href="#contact">お仕事のご相談</Button>
        </div>
      </div>

      <div className={styles.image}>
        <img src="/imgs/image01.png"></img>
      </div>
    </div>
  )
}
