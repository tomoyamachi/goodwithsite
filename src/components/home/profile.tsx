import styles from './profile.module.css'
import Title from '../atoms/title'
import Twitter from '../svgs/twitter'
import GitHub from '../svgs/github'
import Facebook from '../svgs/facebook'

// 認定資格バッジ: カテゴリ括り・テキストを廃しフラットに並べる
// 画像はサイト内に保存し、credly 等の認定検証ページにリンクする
// 出典: https://scrapbox.io/tomoyamachi/about_GOODWITH
const certifications = [
  { name: 'CISSP', image: '/certifications/cissp.png', href: null },
  { name: 'CKAD', image: '/certifications/ckad.png', href: 'https://www.credly.com/badges/4d676f05-f86b-4795-a696-3feef173e468/public_url' },
  { name: 'CKA', image: '/certifications/cka.svg', href: 'https://www.credly.com/badges/bbd4b2d6-9975-4c0d-82e6-f50b49803205/public_url' },
  { name: 'CKS', image: '/certifications/cks.png', href: 'https://www.credly.com/badges/3aca4684-75b6-4fee-af21-acac3c2e56a1/public_url' },
  { name: 'Linux Foundation 1', image: '/certifications/linux-1.png', href: 'https://www.credly.com/badges/87e8d85f-9d5e-4d97-9901-9d2373992c04/public_url' },
  { name: 'Linux Foundation 2', image: '/certifications/linux-2.png', href: 'https://www.credly.com/badges/b05a2351-2763-4165-96a1-1e40dfec08a3/public_url' },
  { name: 'AWS 1', image: '/certifications/aws-1.png', href: 'https://www.credly.com/badges/cca1a105-8c9f-45ed-8206-374b6291d5da/public_url' },
  { name: 'AWS 2', image: '/certifications/aws-2.png', href: 'https://www.credly.com/badges/05a1ccff-4779-4792-b2c8-06447e3224fb/public_url' },
  { name: 'AWS 3', image: '/certifications/aws-3.png', href: 'https://www.credly.com/badges/cf18bc34-f075-4034-a5d9-782b84c964b4/public_url' },
  { name: 'Azure 1', image: '/certifications/azure-1.png', href: 'https://www.credly.com/badges/fdfa3b3f-4474-432a-922c-826a9dcda315' },
  { name: 'Azure 2', image: '/certifications/azure-2.png', href: 'https://www.credly.com/badges/2b1a821d-923d-44cb-af1f-7691af07294a' },
  { name: 'Azure 3', image: '/certifications/azure-3.png', href: 'https://www.credly.com/badges/ef6cedf5-47ee-47f8-ad40-ae7ecf0cd5e0' },
  { name: 'OCI Cloud Operations Associate', image: '/certifications/oci-ops.png', href: 'https://catalog-education.oracle.com/pls/certview/sharebadge?id=636DF08F71E1240D9AC4F1D6F71D58C881978E800F1ABD6F1EF6E80D2CA7DA5C' },
  { name: 'OCI Developer', image: '/certifications/oci-dev.png', href: 'https://catalog-education.oracle.com/pls/certview/sharebadge?id=60E0FB9BA71E014F9E0B5109112D3A1E79C68F06C10E277989A7DD2AC7EC31A7' },
  { name: 'OCI Foundations Associate', image: '/certifications/oci-foundations.png', href: 'https://catalog-education.oracle.com/pls/certview/sharebadge?id=0E06EA9B55E3336472F7663A279C080B1C99094E5244EA618DA54FD0E1595370' },
]

// 執筆/インタビュー: Scrapbox 同様にサムネイル付き
const writings = [
  {
    title: 'Software Design 2019年11月号 寄稿',
    image: '/writings/software-design-201911.png',
    href: 'https://gihyo.jp/magazine/SD/archive/2019/201911',
  },
  {
    title: 'オープンソース界隈を震撼させた、Trivy買収の舞台裏',
    image: '/writings/trivy-acquisition.png',
    href: 'https://note.com/osstokyo/n/nc96669b27365',
  },
]

// 登壇履歴: Scrapbox の発表順を維持
const talks = [
  {
    title: '第43回 Tokyo Jazug Night「Azureで守るマルチクラウド」',
    image: '/talks/tokyo-jazug-43.png',
    href: 'https://jazug.connpass.com/event/275503/',
  },
  {
    title: 'JAWS-UGコンテナ支部 #7「ECS Fargateでも無料で証跡管理したい」',
    image: '/talks/jaws-ug-container-7.png',
    href: 'https://jawsug-container.connpass.com/event/253866/',
  },
  {
    title: 'Rust LT Online #4「Rustコンパイラの中間表現を可視化する」',
    image: '/talks/rust-lt-online-4.png',
    href: 'https://rust.connpass.com/event/215770/',
  },
  {
    title: 'WebSystemArchitecture研究会「XDP(eBPF)を利用したエッジデバイスでのネットワーク制御」',
    image: '/talks/wsa-research.png',
    href: 'https://wsa.connpass.com/event/187128/',
  },
  {
    title: 'InfraStudy #6「クラウド時代のセキュリティをふりかえる」',
    image: '/talks/infra-study-6.png',
    href: 'https://forkwell.connpass.com/event/187694/',
  },
  {
    title: 'EnvoyCon 2020「Creating request buffering filters for edge devices」',
    image: '/talks/envoycon-2020.png',
    href: 'https://events.linuxfoundation.org/envoycon/program/schedule/',
  },
  {
    title: 'July Tech Festa 2020',
    image: '/talks/july-tech-festa-2020.png',
    href: 'https://techfesta.connpass.com/event/175611/',
  },
  {
    title: 'Envoy Meetup',
    image: '/talks/envoy-meetup.png',
    href: 'https://envoytokyo.connpass.com/event/175256/',
  },
  {
    title: 'AVTOKYO 2019「Visualizing Vulnerabilities in Public Container Images」',
    image: '/talks/avtokyo-2019.png',
    href: 'http://ja.avtokyo.org/avtokyo2019/speakers',
  },
  {
    title: 'Go Conference 2019 Autumn',
    image: '/talks/go-conference-2019.png',
    href: 'https://gocon.jp/',
  },
  {
    title: 'Docker Meetup Tokyo #31〜#33',
    image: '/talks/docker-meetup-tokyo.png',
    href: 'https://dockerjp.connpass.com/event/153316/',
  },
  {
    title: 'Vuls祭り #5',
    image: '/talks/vuls-festival-5.png',
    href: 'https://vuls-jp.connpass.com/event/131960/',
  },
  {
    title: 'やっぱり AppEngine ja night #2',
    image: '/talks/appengine-ja-night-2.png',
    href: 'https://gaeja.connpass.com/event/68702/',
  },
]

// 個人の SNS / GitHub のみアイコンで配置。
// GitHub Org (goodwithtech) はフッターと重複するため、Scrapbox は重複情報が多いため省く。
const socialLinks = [
  { label: 'X (Twitter)', href: 'https://x.com/tomoyamachi', Icon: Twitter },
  { label: 'GitHub', href: 'https://github.com/tomoyamachi', Icon: GitHub },
  { label: 'Facebook', href: 'https://www.facebook.com/tomoyamachi', Icon: Facebook },
]

// バッジ1個: テキストなし、画像のみ。href があればリンクで包む
const Badge = ({ name, image, href }) => {
  const img = <img src={image} alt={name} title={name} />
  return href ? (
    <a className={styles.badge} href={href} target="_blank" rel="noopener noreferrer" aria-label={name}>
      {img}
    </a>
  ) : (
    <div className={styles.badge}>{img}</div>
  )
}

// 登壇/執筆カード: サムネイル+タイトル
const ThumbCard = ({ title, image, href }) => (
  <a className={styles.thumbCard} href={href} target="_blank" rel="noopener noreferrer">
    <div className={styles.thumbImage}>
      <img src={image} alt={title} />
    </div>
    <span className={styles.thumbTitle}>{title}</span>
  </a>
)

export default () => (
  <div className={styles.profile}>
    <Title id="profile">PROFILE</Title>

    <div className={styles.head}>
      <div className={styles.headMain}>
        <h3 className={styles.name}>天地 知也 / Tomoya AMACHI</h3>
        <p className={styles.tagline}>
          Trivy 初期コミッタ / Dockle 作者
        </p>
        <p className={styles.role}>GOODWITH LLC 代表</p>
        <div className={styles.socials}>
          {socialLinks.map(({ label, href, Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={styles.socialIcon}
            >
              <Icon height={22} />
            </a>
          ))}
        </div>
      </div>
    </div>

    <div className={styles.section}>
      <h4 className={styles.subhead}>認定資格</h4>
      <div className={styles.badgeGrid}>
        {certifications.map(c => (
          <Badge key={c.name} {...c} />
        ))}
      </div>
    </div>

    <div className={styles.section}>
      <h4 className={styles.subhead}>執筆 / インタビュー</h4>
      <div className={styles.thumbGrid}>
        {writings.map(w => (
          <ThumbCard key={w.title} {...w} />
        ))}
      </div>
    </div>

    <div className={styles.section}>
      <h4 className={styles.subhead}>登壇履歴</h4>
      <div className={styles.thumbGrid}>
        {talks.map(t => (
          <ThumbCard key={t.title} {...t} />
        ))}
      </div>
    </div>

  </div>
)
