import Header from '../../components/layout/header'
import blogStyles from '../../styles/blog.module.css'
import { getDateStr } from '../../lib/blog-helpers'
import { getAllSlugs, getPostBySlug, Post } from '../../lib/posts'

export async function getStaticPaths() {
  return {
    paths: getAllSlugs().map((slug) => ({ params: { slug } })),
    fallback: false,
  }
}

export async function getStaticProps({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPostBySlug(params.slug)
  if (!post) {
    return { notFound: true }
  }
  return { props: { post } }
}

const RenderPost = ({ post }: { post: Post }) => {
  return (
    <>
      <Header titlePre={post.title} ogTitleOverride={`${post.title} | GOODWITH`} />
      <div className={blogStyles.post}>
        <h1>{post.title}</h1>
        {post.authors.length > 0 && (
          <div className="authors">By: {post.authors.join(' ')}</div>
        )}
        {post.date && (
          <div className="posted">Posted: {getDateStr(post.date)}</div>
        )}
        <hr />
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    </>
  )
}

export default RenderPost
