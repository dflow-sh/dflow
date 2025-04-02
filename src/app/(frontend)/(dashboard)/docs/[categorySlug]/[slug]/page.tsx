import { MDXContent } from '@content-collections/mdx/react'
import { allApis, allIntroductions } from 'content-collections'

// Combine all collections
const allDocs = [...allApis, ...allIntroductions]

interface PageProps {
  params: Promise<{
    categorySlug: string
    slug: string
  }>
}

export default async function DocPage({ params }: PageProps) {
  const { categorySlug, slug } = await params

  const doc = allDocs.find(
    d => d.categorySlug === categorySlug && d.slug === slug,
  ) // Find matching doc in all collections

  if (!doc) {
    return <p className='text-gray-500'>Document not found.</p>
  }

  return (
    <article className='prose prose-blue dark:prose-invert'>
      <h1 className='text-2xl font-semibold'>{doc.title}</h1>
      <MDXContent code={doc.mdx} />
    </article>
  )
}
