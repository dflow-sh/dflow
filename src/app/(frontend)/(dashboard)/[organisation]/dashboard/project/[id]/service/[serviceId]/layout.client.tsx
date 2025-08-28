'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import SelectSearch from '@/components/SelectSearch'
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

  const [mounted, setMounted] = useState(false)
  const [populatedVariables, setPopulatedVariables] = useState(
    service.populatedVariables,
  )

  const { setDisable } = useDisableDeploymentContext()
  const defaultPopulatedVariables = service?.populatedVariables ?? '{}'

  useEffect(() => {
    setMounted(true)
  }, [])

  // When environment variables are changed we're disabling the deployments
  // Checking if old-variables and new-variables are changed and enabling deployment actions
  useEffect(() => {
    if (populatedVariables !== service.populatedVariables) {
      setDisable(false)
      setPopulatedVariables(defaultPopulatedVariables)
    }
  }, [service.populatedVariables])

  return (
    <>
      <main className='mx-auto'>{children}</main>

      {mounted && (
        <>
          {createPortal(
            <div className='flex items-center gap-1 text-sm font-normal'>
              <svg
                fill='currentColor'
                viewBox='0 0 20 20'
                className='stroke-border h-5 w-5 flex-shrink-0'
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
