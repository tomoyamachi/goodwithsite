import styles from './products.module.css'
import Title from '../atoms/title'
import Button from '../atoms/button'

const products = {
  AUTHOR: [
    {
      //name: 'dockle',
      name: 'Docker Image Linter for Security and Best Practices',
      url: 'https://github.com/goodwithtech/dockle',
      image: '/products/dockle.png',
      imageWidth: 165,
    },
    {
      //name: 'dockertags',
      name: 'Fetching and summarizing remote docker image tags',
      url: 'https://github.com/goodwithtech/dockertags',
      image: '/products/dockertags.png',
      imageWidth: 200,
    },
  ],
  DEVELOPER: [
    {
      name: 'Vulnerability Scanner for Containers',
      url: 'https://github.com/aquasec/trivy',
      image: '/products/trivy.png',
      imageWidth: 92,
    },
    {
      name: 'Agent-less Vulnerability Scanner',
      url: 'https://github.com/future-architect/vuls',
      image: '/products/vuls.png',
      imageWidth: 210,
    },
  ],
}

const Products = ({ url, name, image, imageWidth }) => (
  <div className={styles.product} key={name}>
    <a href={url}>
      <img src={image} width={imageWidth} />
      <h4>{name}</h4>
      <Button href={url}>LINK</Button>
    </a>
  </div>
)
export default () => (
  <>
    <Title id="products">PRODUCTS</Title>

    {Object.keys(products).map(role => (
      <div key={role}>
        <div className={styles.role}>
          <h3 className="center">{role}</h3>
        </div>
        <div className={styles.products}>
          {products[role].map(product => (
            <Products {...product}></Products>
          ))}
        </div>
      </div>
    ))}
  </>
)
