import styles from './company.module.css'
import Title from '../atoms/title'

// 法人特有情報のみ掲載。代表者名・事業内容は PROFILE / Eyecatch / SOLUTIONS と重複するため除外
const tables = {
  CORPORATE: [
    {
      label: '商号',
      val: '合同会社グッドウィズ(GOODWITH LLC.,)',
    },
    {
      label: '設立',
      val: '2016年7月1日',
    },
  ],
}

const Table = ({ label, val }) => (
  <tr>
    <td key="label" className={styles.label}>
      {label}
    </td>
    <td key="val">{val}</td>
  </tr>
)

export default () => (
  <div className={styles.company}>
    <Title id="company">COMPANY</Title>
    {Object.keys(tables).map(title => (
      <div key={title}>
        <div className={styles.role}>
          <h3 className="center">{title}</h3>
        </div>
        <table className={styles.tables}>
          <tbody>
            {tables[title].map((product, idx) => (
              <Table {...product} key={idx} />
            ))}
          </tbody>
        </table>
      </div>
    ))}
  </div>
)
