import styles from './solutions.module.css'
import Title from '../atoms/title'

const services = [
  {
    title: 'Consultation',
    image: '/imgs/icon-01.png',
    detail:
      'We provide professional consulting on system architecture, especially related to containers',
  },
  {
    title: 'Development',
    image: '/imgs/icon-02.png',
    detail:
      'We have extensive experience in creating products, managing architecture, and achieving operational excellence',
  },
  {
    title: 'Management',
    image: '/imgs/icon-03.png',
    detail:
      'We have professional project management licenses and can help you manage your IT based projects',
  },
]

export default () => (
  <div className={styles.solution}>
    <Title id="solutions">SOLUTIONS</Title>
    <div className={styles.media}>
      <div className={styles.content}>
        <p>
          We provide consulting to solve problems and develop products based in
          IT.
        </p>
        <p>
          We specialize is DevSecOps (DevOps with Security), Container-based
          Architecture Design and Communication between Frontend and Backend.
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
