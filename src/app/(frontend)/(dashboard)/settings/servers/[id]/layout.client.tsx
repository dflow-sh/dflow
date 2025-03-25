'use client'

import { useProgress } from '@bprogress/next'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useEffect, useTransition } from 'react'

import Tabs from '@/components/Tabs'
import { ServerType } from '@/payload-types-overrides'

const tabsList = [
  { label: 'General', slug: 'general', disabled: false },
  { label: 'Plugins', slug: 'plugins', disabled: false },
  { label: 'Domains', slug: 'domains', disabled: false },
  { label: 'Monitoring', slug: 'monitoring', disabled: false },
] as const

const LayoutClient = ({
  children,
  server,
}: {
  children: React.ReactNode
  server: ServerType
}) => {
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringEnum([
      'general',
      'monitoring',
      'plugins',
      'domains',
    ]).withDefault('general'),
  )
  const { start, stop } = useProgress()

  const activeTab = tabsList.findIndex(({ slug }) => {
    return slug === tab
  })

  useEffect(() => {
    if (isPending) {
      start()
    } else {
      stop()
    }
  }, [isPending])

  return (
    <>
      {/* <PageHeader
        title={
          <div className='flex items-center gap-2'>
            <HardDrive />
            {server.name}
          </div>
        }
      /> */}

      <div className='relative'>
        <div className='mx-auto w-full max-w-6xl px-4'>
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
            defaultActiveTab={activeTab >= 0 ? activeTab : 0}
          />
        </div>
        <div className='absolute bottom-[18.5px] z-[-10] h-[1px] w-full bg-border' />
      </div>

      <main className='mx-auto mb-10 mt-4 w-full max-w-6xl px-4'>
        {children}
      </main>
    </>
  )
}

export default LayoutClient
