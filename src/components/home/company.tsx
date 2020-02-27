import styles from './company.module.css'
import Title from '../atoms/title'

const companies = [
  {
    label: 'Company Name',
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
    val: 'IT-based consulting solutions. Especialy Container x Security.',
  },
]

const skills = [
  {
    label: 'Platform',
    val: 'GCP, AWS, Azure',
  },
  {
    label: 'Programming',
    val: 'Go, JavaScript/TypeScript, Python, PHP, Ruby',
  },
  {
    label: 'Orchestrations',
    val: 'Kubernetes, Elastic Container Service(ECS), Docker Swarm',
  },
  {
    label: 'ContainerSecurity',
    val: 'AquaSecurity, Sysdig, TwistLock',
  },
  {
    label: 'Database',
    val: 'MySQL, PostgreSQL, Oracle Database, Redis, MongoDB',
  },
]

export default () => (
  <>
    <Title id="company">COMPANY</Title>

    <div>
      <h2>Corporate Profile</h2>
      <table className={styles.tables}>
        {companies.map(({ label, val }) => (
          <tr key={label}>
            <td>{label}</td>
            <td>{val}</td>
          </tr>
        ))}
      </table>
    </div>
    <div>
      <h2>Skills</h2>
      <table className={styles.tables}>
        {skills.map(({ label, val }) => (
          <tr key={label}>
            <td>{label}</td>
            <td>{val}</td>
          </tr>
        ))}
      </table>
    </div>
  </>
)
