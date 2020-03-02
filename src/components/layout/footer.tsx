import ExtLink from '../ext-link'

import styles from '../../styles/footer.module.css'

import GitHub from '../svgs/github'
import Twitter from '../svgs/twitter'
import Envelope from '../svgs/envelope'
import LinkedIn from '../svgs/linkedin'
import Facebook from '../svgs/facebook'

const contacts = [
  {
    Comp: Twitter,
    alt: 'twitter icon',
    link: 'https://twitter.com/goodwithllc',
  },
  {
    Comp: GitHub,
    alt: 'github icon',
    link: 'https://github.com/goodwithtech',
  },
  {
    Comp: Facebook,
    alt: 'facebook icon',
    link: 'https://fb.me/goodwithllc',
  },
  {
    Comp: LinkedIn,
    alt: 'linkedin icon',
    link: 'https://www.linkedin.com/company/goodwithllc',
  },
  {
    Comp: Envelope,
    alt: 'envelope icon',
    link: 'mailto:info@goodwith.tech',
  },
]

export default () => (
  <footer>
    <div className={styles.links}>
      {contacts.map(({ Comp, link, alt }) => {
        return (
          <ExtLink key={link} href={link} aria-label={alt}>
            <Comp height={32} />
          </ExtLink>
        )
      })}
    </div>
    <div className={styles.logo}>
      <a href="/">
        <img src="/imgs/footer-logo.png" />
      </a>
    </div>
  </footer>
)
