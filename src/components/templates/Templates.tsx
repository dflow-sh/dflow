'use client'

import { Puzzle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import AccessDeniedAlert from '@/components/AccessDeniedAlert'
import PersonalTemplates from '@/components/templates/PersonalTemplates'
import TemplateCard from '@/components/templates/TemplateCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Template as TemplateType } from '@/lib/restSDK/types'
import { CloudProviderAccount, Template } from '@/payload-types'

const Templates = ({
  personalTemplates,
  officialTemplates,
  communityTemplates,
  serverError,
  accounts,
}: {
  personalTemplates: Template[] | undefined
  officialTemplates: TemplateType[] | undefined
  communityTemplates: TemplateType[] | undefined
  serverError: string | undefined
  accounts: CloudProviderAccount[] | undefined
}) => {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'official'

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', tab)
    window.history.replaceState(null, '', `?${params.toString()}`)
  }

  useEffect(() => {
    if (!searchParams.get('tab')) {
      handleTabChange('official')
    }
  }, [])
  return (
    <Tabs
      value={activeTab}
      defaultValue={activeTab}
      onValueChange={value => handleTabChange(value)}
      className='mt-6 w-full'>
      <TabsList>
        <TabsTrigger value='official'>Official</TabsTrigger>
        <TabsTrigger value='community'>Community</TabsTrigger>
        <TabsTrigger value='personal'>Personal</TabsTrigger>
      </TabsList>

      {/* Official Templates */}
      <TabsContent value='official'>
        {officialTemplates && officialTemplates?.length > 0 ? (
          <div className='mt-4 grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
            {officialTemplates?.map((template, index) => (
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
        {communityTemplates && communityTemplates?.length > 0 ? (
          <div className='mt-4 grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
            {communityTemplates?.map(template => (
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
        {serverError ? (
          <AccessDeniedAlert error={serverError} />
        ) : personalTemplates && personalTemplates?.length > 0 ? (
          <PersonalTemplates
            templates={personalTemplates}
            accounts={accounts || []}
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
  )
}

export default Templates
