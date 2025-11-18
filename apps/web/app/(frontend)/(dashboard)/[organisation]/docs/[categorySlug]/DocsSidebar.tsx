import { Menu } from 'lucide-react'

import HighLightedLink from '@/components/docs/HighLightedLink'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
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

  const Links = ({ isDialog = false }: { isDialog?: boolean }) => {
    return sortedCategories.map(({ category, docs }) => (
      <div key={category} className='mb-4'>
        <h2 className='font-semibold md:text-lg'>{category}</h2>

        <ul className='ml-2'>
          {docs.map(doc =>
            isDialog ? (
              <SheetClose asChild>
                <li key={doc.slug} className='block py-1'>
                  <HighLightedLink
                    href={`/${organisation}/docs/${doc.categorySlug}/${doc.slug}`}
                    label={doc.title}
                  />
                </li>
              </SheetClose>
            ) : (
              <li key={doc.slug} className='block py-1'>
                <HighLightedLink
                  href={`/${organisation}/docs/${doc.categorySlug}/${doc.slug}`}
                  label={doc.title}
                />
              </li>
            ),
          )}
        </ul>
      </div>
    ))
  }

  return (
    <>
      <aside
        className={`sticky left-0 top-[105px] hidden w-64 border-r p-4 md:block`}>
        <nav>
          <Links />
        </nav>
      </aside>

      <Sheet>
        <div className='fixed bottom-4 left-0 grid w-full place-items-center md:hidden'>
          <SheetTrigger asChild>
            <Button variant='secondary' className='w-max'>
              <Menu /> Menu
            </Button>
          </SheetTrigger>
        </div>

        <SheetContent>
          <SheetTitle className='mb-4'>Docs</SheetTitle>

          <ScrollArea className='h-[calc(100vh-3.5rem)]'>
            <Links isDialog />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default DocsSidebar
