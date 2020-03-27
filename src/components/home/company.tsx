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
}

const skillMaps = [
  ['GCP', 'AWS', 'Azure'],
  ['Go', 'TypeScript', 'Python', 'PHP'],
  ['Docker', 'Kubernetes'],
  ['AquaSecurity', 'Sysdig', 'Twistlock'],
  ['MySQL', 'PostgreSQL', 'OracleDatabase'],
]

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
          {tables[title].map((product, idx) => (
            <Table {...product} key={idx} />
          ))}
        </table>
      </div>
    ))}

    <div key="skills">
      <div className={styles.role}>
        <h3 className="center">SKILLS</h3>
      </div>
      <div className={styles.skills}>
        {skillMaps.map(skills => (
          <div className={styles.skill}>
            {skills.map(skill => (
              <img alt={skill} src={`/skills/${skill}.png`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
)
