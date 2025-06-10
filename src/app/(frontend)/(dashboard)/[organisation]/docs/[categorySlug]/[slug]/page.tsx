import { MDXContent } from '@content-collections/mdx/react'

import { allDocs } from '@/docs'

type CategorySlugType = keyof typeof allDocs

interface PageProps {
  params: Promise<{
    categorySlug: CategorySlugType
    slug: string
  }>
}

// for now commenting static-generation because of  ⨯ [Error: An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error.] {digest: 'DYNAMIC_SERVER_USAGE' }
// export async function generateStaticParams() {
//   const slugs = Object.entries(allDocs)
//     .map(([_key, docs]) => {
//       return docs.map(({ categorySlug, slug }) => {
//         return { categorySlug, slug }
//       })
//     })
//     .flat()

//   return slugs
// }

const DocPage = async ({ params }: PageProps) => {
  const { categorySlug, slug } = await params
  const categoryDocs = Object.entries(allDocs) ?? [] // Get the specific category collection

  const filteredDocs = categoryDocs
    .map(([_key, docs]) => {
      return docs.filter(
        doc => doc.categorySlug === categorySlug && doc.slug === slug,
      )
    })
    .flat()

  const doc = filteredDocs?.[0]

  if (!doc) {
    return <p className='text-gray-500'>Document not found.</p>
  }

  return (
    <article className='prose prose-purple prose-invert w-full md:prose-lg prose-headings:font-medium prose-headings:text-foreground prose-img:mx-auto prose-img:aspect-video prose-img:w-full prose-img:rounded-md prose-img:object-contain'>
      <MDXContent code={doc.mdx} />
    </article>
  )
}

export default DocPage
