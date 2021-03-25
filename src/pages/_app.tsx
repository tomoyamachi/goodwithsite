import '../styles/global.css'
import Footer from '../components/layout/footer'

export default ({ Component, pageProps }) => (
  <>
    <Component {...pageProps} />
    <Footer />
  </>
)
