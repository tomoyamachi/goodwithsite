import styles from 'company.module.css'

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
    <h1 id="company">COMPANY</h1>

    <div>
      <h2>Corporate Profile</h2>
      <table>
        {companies.map(({ label, val }) => (
          <tr key={label}>
            <td>{label}</td>
            <td>{val}</td>
          </tr>
        ))}
      </table>
    </div>
    <div>
      <table>
        <h2>Skills</h2>
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
