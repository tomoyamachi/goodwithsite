import styles from './products.module.css'
import Title from '../atoms/title'
import Button from '../atoms/button'

const products = {
  author: [
    {
      //name: 'dockle',
      name: 'Docker Image Linter for Security and Best Practice',
      url: 'https://github.com/goodwithtech/dockle',
      image: '/products/dockle.png',
    },
    {
      //name: 'dockertags',
      name: 'Fetching and summarizing remote docker image tags',
      url: 'https://github.com/goodwithtech/dockertags',
      image: 'https://fakeimg.pl/150/',
    },
  ],
  commiter: [
    {
      name: 'Vulnerability Scanner for Containers',
      url: 'https://github.com/aquasec/trivy',
      image: '/products/trivy.png',
    },
    {
      name: 'Agent-less Vulnerability Scanner',
      url: 'https://github.com/future-architect/vuls',
      image: '/products/vuls.png',
    },
  ],
}

const Products = ({ url, name, image }) => (
  <div className={styles.product} key={name}>
    <a href={url}>
      <img src={image} />
      <h4>{name}</h4>
      <Button href={url}>LINK</Button>
    </a>
  </div>
)
export default () => (
  <>
    <Title id="products">OSS</Title>

    {Object.keys(products).map(role => (
      <div key={role}>
        <h3 className="center">{role}</h3>
        <div className={styles.products}>
          {products[role].map(product => (
            <Products {...product}></Products>
          ))}
        </div>
      </div>
    ))}
  </>
)
