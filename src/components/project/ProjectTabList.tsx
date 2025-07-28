'use client'

import { parseAsStringEnum, useQueryState } from 'nuqs'
import { startTransition, useMemo } from 'react'

import Tabs from '@/components/Tabs'
import { cn } from '@/lib/utils'

const ProjectTabsList: React.FC<{
  children?: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringEnum(['general', 'settings']).withDefault('general'),
  )

  const tabsList = useMemo(() => {
    return [
      { label: 'General', slug: 'general', disabled: false },
      { label: 'Settings', slug: 'settings', disabled: false },
    ] as const
  }, [])

  const activeTab = tabsList.findIndex(({ slug }) => {
    return slug === tab
  })

  return (
    <>
      <div className={cn('sticky top-[68px] z-40 bg-background')}>
        <div
          className='mx-auto w-full max-w-6xl overflow-x-scroll px-4'
          style={{ scrollbarWidth: 'none' }}>
          <Tabs
            tabs={tabsList.map(({ label, disabled }) => ({ label, disabled }))}
            onTabChange={index => {
              const tab = tabsList[index]

              startTransition(() => {
                setTab(tab.slug, {
                  shallow: false,
                })
              })
            }}
            activeTab={activeTab >= 0 ? activeTab : 0}
            defaultActiveTab={activeTab >= 0 ? activeTab : 0}
          />
        </div>

        <div className='absolute bottom-0 z-[-10] h-[1px] w-full bg-border' />
      </div>

      <main
        className={cn('mx-auto mb-10 mt-4 w-full max-w-6xl px-4', className)}>
        {children}
      </main>
    </>
  )
}

export default ProjectTabsList
