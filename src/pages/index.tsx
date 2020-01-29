import Link from 'next/link'
import Header from '../components/header'
import ExtLink from '../components/ext-link'
import Products from '../components/products'
import GitHub from '../components/svgs/github'
import sharedStyles from '../styles/shared.module.css'

export default () => (
  <div>
    <Header titlePre="Home" />
    <div className={sharedStyles.layout}>
      <h1>Container Security Specialist</h1>

      <Products />
    </div>
  </div>
)
