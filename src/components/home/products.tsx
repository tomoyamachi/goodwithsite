import styles from '../../styles/products.module.css'

const products = [
  {
    name: 'dockle',
    url: 'https://github.com/goodwithtech/dockle',
    image: 'https://fakeimg.pl/150/',
    role: 'author',
  },
  {
    name: 'dockertags',
    url: 'https://github.com/goodwithtech/dockertags',
    image: 'https://fakeimg.pl/150/',
    role: 'author',
  },
  {
    name: 'trivy',
    url: 'https://github.com/aquasec/trivy',
    image: 'https://fakeimg.pl/150/',
    role: 'committer',
  },
  {
    name: 'vuls',
    url: 'https://github.com/future-architect/vuls',
    image: 'https://fakeimg.pl/150/',
    role: 'committer',
  },
]

export default () => (
  <>
    <h1 id="products">PRODUCTS</h1>
    <div className={styles.products}>
      {products.map(({ name, url, image, role }) => (
        <div className={styles.product} key={name}>
          <a href={url}>
            <img src={image} />
            <h4>
              {name}({role})
            </h4>
          </a>
        </div>
      ))}
    </div>
  </>
)
