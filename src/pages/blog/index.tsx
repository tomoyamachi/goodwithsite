import Link from 'next/link'
import Header from '../../components/layout/header'

import blogStyles from '../../styles/blog.module.css'
import sharedStyles from '../../styles/shared.module.css'

import { getBlogLink, getDateStr } from '../../lib/blog-helpers'
import { getAllPostsMeta, PostMeta } from '../../lib/posts'

export async function getStaticProps() {
  const posts = getAllPostsMeta()
  return { props: { posts } }
}

const Index = ({ posts }: { posts: PostMeta[] }) => {
  return (
    <>
      <Header titlePre="Blog" />
      <div className={`${sharedStyles.layout} ${blogStyles.blogIndex}`}>
        <h1>Posts</h1>
        {posts.length === 0 && (
          <p className={blogStyles.noPosts}>There are no posts yet</p>
        )}
        {posts.map((post) => (
          <div className={blogStyles.postPreview} key={post.slug}>
            <h3>
              <span className={blogStyles.titleContainer}>
                {!post.published && (
                  <span className={blogStyles.draftBadge}>Draft</span>
                )}
                <Link href="/blog/[slug]" as={getBlogLink(post.slug)}>
                  {post.title}
                </Link>
              </span>
            </h3>
            {post.authors.length > 0 && (
              <span className={blogStyles.author}>
                By {post.authors.join(' ')}
              </span>
            )}
            {post.date && (
              <span className={blogStyles.posted}>
                {' '}
                at {getDateStr(post.date)}
              </span>
            )}
            {post.description && <p>{post.description}</p>}
          </div>
        ))}
      </div>
    </>
  )
}

export default Index
