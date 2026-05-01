import styles from './products.module.css'
import Title from '../atoms/title'

// OSS への関わり: 役割を各カードのラベルとして表示し、横並び1行で見せる
// Trivy は INITIAL COMMITTER として強調するためカードに装飾を付ける
const products = [
  {
    role: 'AUTHOR',
    name: 'Container Linter for Security and Best Practices',
    url: 'https://github.com/goodwithtech/dockle',
    image: '/products/dockle.png',
    imageWidth: 165,
    highlight: false,
  },
  {
    role: 'AUTHOR',
    name: 'Fetching and summarizing remote docker image tags',
    url: 'https://github.com/goodwithtech/dockertags',
    image: '/products/dockertags.png',
    imageWidth: 200,
    highlight: false,
  },
  {
    role: 'INITIAL COMMITTER',
    name: 'Vulnerability scanner for Containers',
    url: 'https://github.com/aquasec/trivy',
    image: '/products/trivy.png',
    imageWidth: 92,
    highlight: true,
  },
  {
    role: 'COMMITTER',
    name: 'Agent-less Vulnerability Scanner',
    url: 'https://github.com/future-architect/vuls',
    image: '/products/vuls.png',
    imageWidth: 210,
    highlight: false,
  },
]

const Product = ({ url, name, image, imageWidth, role, highlight }) => (
  <div className={`${styles.product} ${highlight ? styles.highlight : ''}`}>
    <a href={url}>
      <span className={styles.role}>{role}</span>
      <div className={styles.productImage}>
        <img src={image} width={imageWidth} alt={name} />
      </div>
      <h4>{name}</h4>
    </a>
  </div>
)

export default () => (
  <>
    <Title id="products">PRODUCTS</Title>
    <div className={styles.products}>
      {products.map((product, idx) => (
        <Product key={idx} {...product} />
      ))}
    </div>
  </>
)
