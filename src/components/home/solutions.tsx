import styles from './solutions.module.css'
import Title from '../atoms/title'

const services = [
  {
    title: 'Consulting',
    image: '/imgs/icon-01.png',
    detail: 'We can advice your system architecture.',
  },
  {
    title: 'Development',
    image: '/imgs/icon-02.png',
    detail: 'We develop your system, from inflastructure to programming.',
  },
  {
    title: 'Management',
    image: '/imgs/icon-03.png',
    detail:
      'We can manage your project, we have professional project managemente licences.',
  },
]

export default () => (
  <div className={styles.solution}>
    <Title id="solutions">SOLUTIONS</Title>
    <div className={styles.media}>
      <div className={styles.content}>
        <p>
          Our value is problem-solving consulting and service development based
          on IT. DevSecOps (DevOps with Security), secure container deployment
          technologies, and container-based architecture design.
        </p>
      </div>
      <div className={styles.image}>
        <img src="/imgs/image02.png"></img>
      </div>
    </div>
    <div className={styles.services}>
      {services.map(service => (
        <Services {...service}></Services>
      ))}
    </div>
  </div>
)

const Services = ({ title, image, detail }) => (
  <div className={styles.service} key={title}>
    <img src={image} />
    <h4>{title}</h4>
    <p>{detail}</p>
  </div>
)
