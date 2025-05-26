import { MDXContent } from '@content-collections/mdx/react'
import {
  allIntroductions,
  allOnboardings,
  allSecurities,
  allServers,
  allServices,
  allTemplates,
} from 'content-collections'
import { Suspense, use } from 'react'

import { DocsSkeleton } from '@/components/skeletons/DocsSkeleton'

// Combine all collections
const allDocs = [
  ...allIntroductions,
  ...allServers,
  ...allOnboardings,
  ...allServices,
  ...allSecurities,
  ...allTemplates,
]

interface PageProps {
  params: Promise<{
    categorySlug: string
    slug: string
  }>
}

const SuspendedDocPage = ({ params }: PageProps) => {
  const { categorySlug, slug } = use(params)

  const doc = allDocs.find(
    d => d.categorySlug === categorySlug && d.slug === slug,
  ) // Find matching doc in all collections

  if (!doc) {
    return <p className='text-gray-500'>Document not found.</p>
  }

  return (
    <article className='prose prose-purple prose-invert md:prose-lg prose-headings:font-medium prose-headings:text-foreground prose-img:mx-auto prose-img:aspect-video prose-img:w-full prose-img:rounded-md prose-img:object-contain'>
      <MDXContent code={doc.mdx} />
    </article>
  )
}

const DocPage = ({ params }: PageProps) => {
  return (
    <Suspense fallback={<DocsSkeleton />}>
      <SuspendedDocPage params={params} />
    </Suspense>
  )
}

export default DocPage
