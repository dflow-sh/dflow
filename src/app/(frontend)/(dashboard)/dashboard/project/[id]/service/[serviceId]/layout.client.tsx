'use client'

import { useProgress } from '@bprogress/next'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useEffect, useMemo, useTransition } from 'react'

import Tabs from '@/components/Tabs'

const LayoutClient = ({
  children,
  type,
}: {
  children: React.ReactNode
  type: 'database' | 'app' | 'docker'
}) => {
  const [isPending, startTransition] = useTransition()
  const { start, stop } = useProgress()
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringEnum([
      'general',
      'environment',
      'logs',
      'domains',
      'deployments',
    ]).withDefault('general'),
  )

  useEffect(() => {
    if (isPending) {
      start()
    } else {
      stop()
    }
  }, [isPending])

  const tabsList = useMemo(() => {
    return type === 'database'
      ? ([
          { label: 'General', slug: 'general', disabled: false },
          { label: 'Logs', slug: 'logs', disabled: false },
          { label: 'Deployments', slug: 'deployments', disabled: false },
        ] as const)
      : ([
          { label: 'General', slug: 'general', disabled: false },
          { label: 'Environment', slug: 'environment', disabled: false },
          { label: 'Logs', slug: 'logs', disabled: false },
          { label: 'Deployments', slug: 'deployments', disabled: false },
          { label: 'Domains', slug: 'domains', disabled: false },
        ] as const)
  }, [type])

  const activeTab = tabsList.findIndex(({ slug }) => {
    return slug === tab
  })

  return (
    <>
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

      <div className='mb-8 max-w-5xl'>{children}</div>
    </>
  )
}

export default LayoutClient
