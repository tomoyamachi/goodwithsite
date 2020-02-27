import styles from './title.module.css'
export default ({ id, children }) => (
  <>
    <div className={styles.title}>
      <h5>&#123;</h5>
      <h2 className="center" id={id}>
        {children}
      </h2>
      <h5>&#125;</h5>
    </div>
  </>
)
