import Header from '../components/layout/header'
import Eyecatch from '../components/home/eyecatch'
import Profile from '../components/home/profile'
import Products from '../components/home/products'
import Solutions from '../components/home/solutions'
import Works from '../components/home/works'
import Contact from '../components/home/contact'
import Company from '../components/home/company'
import sharedStyles from '../styles/shared.module.css'

export default () => (
  <div>
    <Header titlePre="Home" />
    <div className={sharedStyles.layout}>
      <Eyecatch />
      <Products />
      <Profile />
      <Solutions />
      <Works />
      <Contact />
      <Company />
    </div>
  </div>
)
