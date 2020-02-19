import styles from './eyecatch.module.css'
import Button from '../atoms/button'

export default () => {
  return (
    <div className={styles.media}>
      <div className={styles.content}>
        <h1>Container Security Specialist</h1>
        <Button href="/hoge">MORE</Button>
      </div>

      <div className={styles.image}>
        <img src="/imgs/TOP_image01.png"></img>
      </div>
    </div>
  )
}
