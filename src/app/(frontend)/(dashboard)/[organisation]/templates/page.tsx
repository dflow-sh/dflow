import LayoutClient from '../layout.client'
import { Plus, Puzzle } from 'lucide-react'
import Link from 'next/link'

import { getCloudProvidersAccountsAction } from '@/actions/cloud'
import {
  getAllOfficialTemplatesAction,
  getPersonalTemplatesAction,
} from '@/actions/templates'
import AccessDeniedAlert from '@/components/AccessDeniedAlert'
import PersonalTemplates from '@/components/templates/PersonalTemplates'
import TemplateCard from '@/components/templates/TemplateCard'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PageProps {
  params: Promise<{ organisation: string }>
}

const page = async ({ params }: PageProps) => {
  const syncParams = await params
  const personalTemplates = await getPersonalTemplatesAction({
    type: 'personal',
  })
  const officialTemplates = await getAllOfficialTemplatesAction({
    type: 'official',
  })
  const communityTemplates = await getAllOfficialTemplatesAction({
    type: 'community',
  })

  const accounts = await getCloudProvidersAccountsAction({
    type: 'dFlow',
  })

  return (
    <LayoutClient>
      <section>
        <div className='flex w-full justify-between'>
          <div className='inline-flex items-center gap-2 text-2xl font-semibold'>
            <Puzzle />
            <h3>Templates</h3>
          </div>

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
            <TabsTrigger value='community'>Community</TabsTrigger>
            <TabsTrigger value='personal'>Personal</TabsTrigger>
          </TabsList>

          {/* Official Templates */}
          <TabsContent value='official'>
            {officialTemplates?.data && officialTemplates?.data?.length > 0 ? (
              <div className='mt-4 grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
                {officialTemplates?.data?.map((template, index) => (
                  <TemplateCard key={index} template={template} />
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
          {/* Community Templates */}
          <TabsContent value='community'>
            {communityTemplates?.data &&
            communityTemplates?.data?.length > 0 ? (
              <div className='mt-4 grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
                {communityTemplates?.data?.map(template => (
                  <TemplateCard key={template.id} template={template} />
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
          {/* Personal Templates */}
          <TabsContent value='personal'>
            {personalTemplates?.serverError ? (
              <AccessDeniedAlert error={personalTemplates?.serverError} />
            ) : personalTemplates?.data &&
              personalTemplates?.data?.length > 0 ? (
              <PersonalTemplates
                templates={personalTemplates?.data}
                accounts={accounts?.data || []}
              />
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
