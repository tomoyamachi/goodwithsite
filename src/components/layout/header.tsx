import Link from 'next/link'
import Head from 'next/head'
import ExtLink from '../ext-link'
import { useRouter } from 'next/router'
import styles from '../../styles/header.module.css'

const navItems: { label: string; page?: string; link?: string }[] = [
  { label: 'BLOG', page: '/blog' },
]

const ogImageUrl = 'https://www.goodwith.tech/og-image.jpg'

export default ({ titlePre = '' }) => {
  const { pathname } = useRouter()

  return (
    <header className={styles.header}>
      <Head>
        <title>{titlePre ? `${titlePre} |` : ''} GOODWITH</title>
        <link rel="shortcut icon" href="/imgs/favicon.ico" />
        <meta
          name="description"
          content="We provide consulting to solve problems and develop products based in IT"
        />
        <meta property="og:site_name" content="Goodwith" />
        <meta property="og:url" content="https://www.goodwith.tech/" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Goodwith - We design DevSecOps on Containers"
        />
        <meta
          name="twitter:title"
          content="Goodwith - We design DevSecOps on Containers"
        />
        <meta
          property="og:description"
          content="We provide consulting to solve problems and develop products based in IT"
        />
        <meta
          name="twitter:description"
          content="We provide consulting to solve problems and develop products based in IT"
        />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:site" content="@goodwithllc" />
        <meta name="twitter:card" content="summary_large_image" />
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
