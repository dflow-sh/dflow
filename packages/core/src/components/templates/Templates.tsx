'use client'

import { Puzzle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import AccessDeniedAlert from '@dflow/core/components/AccessDeniedAlert'
import PersonalTemplates from '@dflow/core/components/templates/PersonalTemplates'
import TemplateCard from '@dflow/core/components/templates/TemplateCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@dflow/core/components/ui/tabs'
import { Template as TemplateType } from '@dflow/core/lib/restSDK/types'
import { CloudProviderAccount, Template } from '@dflow/core/payload-types'

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
            <AnimatePresence mode='popLayout'>
              {officialTemplates?.map((template, index) => (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -20,
                    transition: { duration: 0.2 },
                  }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}>
                  <TemplateCard template={template} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='flex-co flex h-[50vh] w-full flex-col items-center justify-center space-y-2'>
            <Puzzle
              strokeWidth={1}
              size={62}
              className='text-muted-foreground opacity-50'
            />
            <p className='text-muted-foreground'>No Templates found</p>
          </motion.div>
        )}
      </TabsContent>

      {/* Community Templates */}
      <TabsContent value='community'>
        {communityTemplates && communityTemplates?.length > 0 ? (
          <div className='mt-4 grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
            <AnimatePresence mode='popLayout'>
              {communityTemplates?.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -20,
                    transition: { duration: 0.2 },
                  }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}>
                  <TemplateCard template={template} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='flex-co flex h-[50vh] w-full flex-col items-center justify-center space-y-2'>
            <Puzzle
              strokeWidth={1}
              size={62}
              className='text-muted-foreground opacity-50'
            />
            <p className='text-muted-foreground'>No Templates found</p>
          </motion.div>
        )}
      </TabsContent>

      {/* Personal Templates */}
      <TabsContent value='personal'>
        {serverError ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}>
            <AccessDeniedAlert error={serverError} />
          </motion.div>
        ) : personalTemplates && personalTemplates?.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}>
            <PersonalTemplates
              templates={personalTemplates}
              accounts={accounts || []}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='flex-co flex h-[50vh] w-full flex-col items-center justify-center space-y-2'>
            <Puzzle
              strokeWidth={1}
              size={62}
              className='text-muted-foreground opacity-50'
            />
            <p className='text-muted-foreground'>No Templates found</p>
          </motion.div>
        )}
      </TabsContent>
    </Tabs>
  )
}

export default Templates
