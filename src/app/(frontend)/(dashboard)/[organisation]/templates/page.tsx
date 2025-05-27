import LayoutClient from '../../layout.client'
import { Plus, Puzzle } from 'lucide-react'
import Link from 'next/link'

import { getTemplates } from '@/actions/pages/Template'
import TemplateCard from '@/components/templates/TemplateCard'
import TemplateDetails from '@/components/templates/TemplateDetails'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Template } from '@/payload-types'

interface PageProps {
  params: Promise<{ organisation: string }>
}

const page = async ({ params }: PageProps) => {
  const syncParams = await params
  const templates = await getTemplates()

  const res = await fetch('https://dflow.sh/api/templates')
  const officialTemplatesData = await res.json()

  return (
    <LayoutClient>
      <section>
        <div className='flex w-full justify-between'>
          <h3 className='text-2xl font-semibold'>Templates</h3>

          <Button asChild className='w-min'>
            <Link
              href={`/${syncParams.organisation}/templates/compose`}
              className='flex items-center gap-2'>
              <Plus />
              Create Template
            </Link>
          </Button>
        </div>

        <Tabs defaultValue='official' className='mt-6 w-full'>
          <TabsList>
            <TabsTrigger value='official'>Official</TabsTrigger>
            <TabsTrigger value='personal'>Personal</TabsTrigger>
          </TabsList>

          {/* Official Templates */}
          <TabsContent value='official'>
            <div className='mt-4 grid w-full grid-cols-3 gap-5'>
              {officialTemplatesData?.docs?.length! > 0 ? (
                officialTemplatesData?.docs?.map(
                  (template: Template, index: number) => (
                    <TemplateCard key={index} template={template} />
                  ),
                )
              ) : (
                <div className='flex-co flex h-[50vh] w-full flex-col items-center justify-center space-y-2'>
                  <Puzzle
                    strokeWidth={1}
                    size={62}
                    className='text-muted-foreground opacity-50'
                  />
                  <p className='text-muted-foreground'>No Templates found</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Personal Templates */}
          <TabsContent value='personal'>
            {templates?.data?.length! > 0 ? (
              <div className='mt-4 grid w-full grid-cols-3 gap-5'>
                {templates?.data?.map(template => (
                  <TemplateDetails key={template.id} template={template} />
                ))}
              </div>
            ) : (
              <div className='flex-co flex h-[50vh] w-full flex-col items-center justify-center space-y-2'>
                <Puzzle
                  strokeWidth={1}
                  size={62}
                  className='text-muted-foreground opacity-50'
                />
                <p className='text-muted-foreground'>No Templates found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </LayoutClient>
  )
}

export default page
