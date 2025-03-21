'use client'

import { useProgress } from '@bprogress/next'
import { HardDrive } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useEffect, useTransition } from 'react'

import PageHeader from '@/components/PageHeader'
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
      <PageHeader
        title={
          <div className='flex items-center gap-2'>
            <HardDrive />
            {server.name}
          </div>
        }
      />

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

      <div className='mb-8 max-w-5xl'>{children}</div>
    </>
  )
}

export default LayoutClient
