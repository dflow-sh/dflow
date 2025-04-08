'use client'

import { useProgress } from '@bprogress/next'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'

import SelectSearch from '@/components/SelectSearch'
import Tabs from '@/components/Tabs'
import { isDemoEnvironment } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Project, Service } from '@/payload-types'

const LayoutClient = ({
  children,
  project,
  services,
  type,
  serviceName,
}: {
  children: React.ReactNode
  type: 'database' | 'app' | 'docker'
  project: Project | string
  serviceName: string
  services: Service[]
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

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
      <div
        className={cn(
          'sticky z-40 bg-background',
          isDemoEnvironment ? 'top-[116px]' : 'top-[68px]',
        )}>
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
        <div className='absolute bottom-[18.5px] z-[-10] h-[1px] w-full bg-border' />
      </div>

      <main className='mx-auto mb-10 mt-4 w-full max-w-6xl px-4'>
        {children}
      </main>

      {mounted &&
        createPortal(
          <div className='flex items-center gap-1 text-sm font-normal'>
            <svg
              fill='currentColor'
              viewBox='0 0 20 20'
              className='h-5 w-5 flex-shrink-0 stroke-border'
              aria-hidden='true'>
              <path d='M5.555 17.776l8-16 .894.448-8 16-.894-.448z'></path>
            </svg>{' '}
            {serviceName}
            <SelectSearch
              placeholder='service'
              services={services}
              projectId={(project as Project).id}
            />
          </div>,
          document.getElementById('serviceName') ?? document.body,
        )}
    </>
  )
}

export default LayoutClient
