import styles from './button.module.css'

export default ({ href, children }) => (
  <a className={styles.btn} href={href}>
    {children}
  </a>
)
