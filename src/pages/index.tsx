import Header from '../components/layout/header'
import Eyecatch from '../components/home/eyecatch'
import Products from '../components/home/products'
import Solutions from '../components/home/solutions'
import Company from '../components/home/company'
import sharedStyles from '../styles/shared.module.css'

export default () => (
  <div>
    <Header titlePre="Home" />
    <div className={sharedStyles.layout}>
      <Eyecatch />
      <Products />
      <Solutions />
      <Company />
    </div>
  </div>
)
