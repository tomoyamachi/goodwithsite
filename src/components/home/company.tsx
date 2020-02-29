import styles from './company.module.css'
import Title from '../atoms/title'

const tables = {
  COORPORATE: [
    {
      label: 'Name',
      val: 'GOODWITH LLC.,',
    },
    {
      label: 'Established',
      val: '07/01/2016',
    },
    {
      label: 'CEO',
      val: 'Tomoya AMACHI',
    },
    {
      label: 'Operations',
      val: 'IT-based consulting solutions, especialy Container x Security.',
    },
  ],
  SKILLS: [
    {
      label: 'Platform',
      val: 'GCP, AWS, Azure',
    },
    {
      label: 'Programming',
      val: 'Go, TypeScript, Python, PHP',
    },
    {
      label: 'Orchestrations',
      val: 'Kubernetes, Elastic Container Service',
    },
    {
      label: 'Container Security',
      val: 'AquaSecurity, Sysdig, TwistLock',
    },
    {
      label: 'Database',
      val: 'MySQL, PostgreSQL, Oracle Database',
    },
  ],
}

const Table = ({ label, val }) => (
  <tr key={label}>
    <td className={styles.label}>{label}</td>
    <td>{val}</td>
  </tr>
)

export default () => (
  <>
    <Title id="company">COMPANY</Title>

    {Object.keys(tables).map(title => (
      <div key={title}>
        <div className={styles.role}>
          <h3 className="center">{title}</h3>
        </div>
        <table className={styles.tables}>
          {tables[title].map(product => (
            <Table {...product} />
          ))}
        </table>
      </div>
    ))}
  </>
)
