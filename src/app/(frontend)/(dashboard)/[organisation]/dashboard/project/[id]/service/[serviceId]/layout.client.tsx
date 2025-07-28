'use client'

import { useProgress } from '@bprogress/next'
import { useParams } from 'next/navigation'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'

import SelectSearch from '@/components/SelectSearch'
import Tabs from '@/components/Tabs'
import { cn } from '@/lib/utils'
import { Service } from '@/payload-types'
import { useDisableDeploymentContext } from '@/providers/DisableDeployment'

const LayoutClient = ({
  children,
  services,
  type,
  serviceName,
  service,
}: {
  children: React.ReactNode
  type: 'database' | 'app' | 'docker'
  serviceName: string
  services: Service[]
  service: Service
}) => {
  const params = useParams<{
    serviceId: string
    organisation: string
    id: string
  }>()
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
      'backup',
      'volumes',
      'scaling',
      'settings',
    ]).withDefault('general'),
  )
  const [mounted, setMounted] = useState(false)
  const [populatedVariables, setPopulatedVariables] = useState(
    service.populatedVariables,
  )

  const { setDisable } = useDisableDeploymentContext()
  const defaultPopulatedVariables = service?.populatedVariables ?? '{}'

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

  // When environment variables are changed we're disabling the deployments
  // Checking if old-variables and new-variables are changed and enabling deployment actions
  useEffect(() => {
    if (populatedVariables !== service.populatedVariables) {
      setDisable(false)
      setPopulatedVariables(defaultPopulatedVariables)
    }
  }, [service.populatedVariables])

  const tabsList = useMemo(() => {
    return type === 'database'
      ? ([
          { label: 'General', slug: 'general', disabled: false },
          { label: 'Logs', slug: 'logs', disabled: false },
          { label: 'Deployments', slug: 'deployments', disabled: false },
          { label: 'Backup', slug: 'backup', disabled: false },
          { label: 'Settings', slug: 'settings', disabled: false },
        ] as const)
      : ([
          { label: 'General', slug: 'general', disabled: false },
          { label: 'Environment', slug: 'environment', disabled: false },
          { label: 'Logs', slug: 'logs', disabled: false },
          { label: 'Deployments', slug: 'deployments', disabled: false },
          { label: 'Scaling', slug: 'scaling', disabled: false },
          { label: 'Domains', slug: 'domains', disabled: false },
          { label: 'Volumes', slug: 'volumes', disabled: false },
          { label: 'Settings', slug: 'settings', disabled: false },
        ] as const)
  }, [type])

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

      <main className='mx-auto mb-10 mt-4 w-full max-w-6xl px-4'>
        {children}
      </main>

      {mounted && (
        <>
          {createPortal(
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
                organisationSlug={params.organisation}
                placeholder='service'
                services={services}
                serviceId={params.serviceId}
                projectId={params.id}
              />
            </div>,
            document.getElementById('serviceName') ?? document.body,
          )}
        </>
      )}
    </>
  )
}

export default LayoutClient
