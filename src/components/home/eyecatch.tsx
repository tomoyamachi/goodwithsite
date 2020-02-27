import styles from './eyecatch.module.css'
import Button from '../atoms/button'
export default () => {
  return (
    <div className={styles.media}>
      <div className={styles.content}>
        <h1>We design DevSecOps on Containers</h1>
        <div className={styles.body}>
          <Button href="/#solutions">MORE ></Button>
        </div>
      </div>

      <div className={styles.image}>
        <img src="/imgs/image01.png"></img>
      </div>
    </div>
  )
}
