import '../styles/global.css'
import ExtLink from '../components/ext-link'
import Footer from '../components/layout/footer'

export default ({ Component, pageProps }) => (
  <>
    <Component {...pageProps} />
    <Footer />
  </>
)
