import Link from 'next/link'
import Head from 'next/head'
import ExtLink from './ext-link'
import { useRouter } from 'next/router'
import styles from '../styles/header.module.css'

const navItems: { label: string; page?: string; link?: string }[] = [
  { label: 'PRODUCTS', page: '/#products' },
  { label: 'SOLUTIONS', page: '/#solutions' },
  { label: 'BLOG', page: '/blog' },
]

const ogImageUrl = 'https://notion-blog.tomoyamachi.now.sh/big-logo.png'

export default ({ titlePre = '' }) => {
  const { pathname } = useRouter()

  return (
    <header className={styles.header}>
      <Head>
        <title>{titlePre ? `${titlePre} |` : ''} My Notion Blog</title>
        <meta name="description" content="GOODWITH LLC.," />
        <meta name="og:title" content="GOODWITH LLC.," />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:site" content="@tomoyamachi" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Head>
      <div className={styles.container}>
        <div className={styles.logo}>
          <a href="/">
            <img src="/big-logo.png" />
          </a>
        </div>
        <div className={styles.navigation}>
          <ul>
            {navItems.map(({ label, page, link }) => (
              <li key={label}>
                {page ? (
                  <Link href={page}>
                    <a className={pathname === page ? 'active' : undefined}>
                      {label}
                    </a>
                  </Link>
                ) : (
                  <ExtLink href={link}>{label}</ExtLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}
