import Link from 'next/link'
import Head from 'next/head'
import ExtLink from '../ext-link'
import { useRouter } from 'next/router'
import styles from '../../styles/header.module.css'
import { buildMetaTags } from '../../lib/meta'

const navItems: { label: string; page?: string; link?: string }[] = [
  { label: 'BLOG', page: '/blog' },
]

interface HeaderProps {
  // ブラウザタブの <title> に前置するテキスト（例: 記事タイトル）
  titlePre?: string
  // og:title / twitter:title を共通値ではなくこの値に差し替える（ブログ記事ページ用）
  ogTitleOverride?: string
}

export default ({ titlePre = '', ogTitleOverride }: HeaderProps) => {
  const { pathname } = useRouter()
  const meta = buildMetaTags({ ogTitleOverride })

  return (
    <header className={styles.header}>
      <Head>
        <title>{`${titlePre ? `${titlePre} |` : ''} GOODWITH`}</title>
        <link rel="shortcut icon" href="/imgs/favicon.ico" />
        <meta name="description" content={meta.description} />
        <meta property="og:site_name" content="Goodwith" />
        <meta property="og:url" content="https://www.goodwith.tech/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={meta.ogTitle} />
        <meta name="twitter:title" content={meta.twitterTitle} />
        <meta property="og:description" content={meta.ogDescription} />
        <meta name="twitter:description" content={meta.twitterDescription} />
        <meta property="og:image" content={meta.ogImageUrl} />
        <meta name="twitter:image" content={meta.ogImageUrl} />
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
                  <Link href={page} className={pathname === page ? 'active' : undefined}>
                    {label}
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
