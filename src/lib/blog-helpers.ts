export const getBlogLink = (slug: string) => `/blog/${slug}`

export const getDateStr = (date: string) =>
  new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
