import HighLightedLink from '@/components/docs/HighLightedLink'
import { allDocs } from '@/docs'

interface Props {
  params: Promise<{
    organisation: string
  }>
}

const formattedDocs = Object.entries(allDocs)
  .map(([_key, docs]) => docs)
  .flat()

type Doc = (typeof formattedDocs)[number]
type GroupedDocs = Record<string, Doc[]>

const groupedDocs: GroupedDocs = formattedDocs.reduce<GroupedDocs>(
  (acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = []
    }

    acc[doc.category].push(doc)
    return acc
  },
  {},
)

const sortedCategories = Object.entries(groupedDocs)
  .sort(
    (a, b) => (a[1][0].categoryOrder ?? 999) - (b[1][0].categoryOrder ?? 999),
  )
  .map(([category, docs]) => ({
    category,
    docs: docs.sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
  }))

const DocsSidebar = async ({ params }: Props) => {
  const { organisation } = await params

  return (
    <aside className={`sticky left-0 top-[120px] h-screen w-64 border-r p-4`}>
      <nav>
        {sortedCategories.map(({ category, docs }) => (
          <div key={category} className='mb-4'>
            <h2 className='text-lg font-semibold'>{category}</h2>
            <ul className='ml-2'>
              {docs.map(doc => (
                <li key={doc.slug} className='py-1'>
                  <HighLightedLink
                    href={`/${organisation}/docs/${doc.categorySlug}/${doc.slug}`}
                    label={doc.title}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default DocsSidebar
