import styles from './products.module.css'
import Title from '../atoms/title'
import Button from '../atoms/button'

const products = {
  AUTHOR: [
    {
      //name: 'dockle',
      name: 'Container Linter for Security and Best Practices',
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
      name: 'Vulnerability scanner for Containers',
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
  <div className={styles.product}>
    <a href={url}>
      <div className={styles.productImage}>
        <img src={image} width={imageWidth} />
      </div>
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
        <div className={styles.role} key={role}>
          <h3 className="center">{role}</h3>
        </div>
        <div className={styles.products} key="products">
          {products[role].map((product, idx) => (
            <Products key={idx} {...product}></Products>
          ))}
        </div>
      </div>
    ))}
  </>
)
