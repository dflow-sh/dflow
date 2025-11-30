'use client'

import { toast, useAllFormFields } from '@payloadcms/ui'
import { Button } from '@payloadcms/ui/elements/Button'
import { CircleCheck } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { BeforeDocumentControlsClientProps } from 'payload'
import { reduceFieldsToValues } from 'payload/shared'

import { installMonitoringToolsAction } from '@/actions/beszel'
import Loader from '@/components/Loader'
import { Server } from '@/payload-types'

const InstallMonitoringTools = (props: BeforeDocumentControlsClientProps) => {
  const [fields, dispatchFields] = useAllFormFields()
  const server = reduceFieldsToValues(fields, true) as Server

  const { execute, isPending, hasSucceeded } = useAction(
    installMonitoringToolsAction,
    {
      onError: ({ error }) => {
        toast.error(`Failed to install monitoring tools: ${error?.serverError}`)
      },
    },
  )

  const handleInstallMonitoring = () => {
    execute({ serverId: server.id })
  }

  return (
    <div className='space-y-2'>
      {hasSucceeded ? (
        <div className='flex items-center gap-2'>
          <CircleCheck size={24} className='text-green-600' />
          Monitoring tools installed
        </div>
      ) : isPending ? (
        <div className='flex items-center gap-2'>
          <Loader className='h-max w-max' /> Installing monitoring tools...
        </div>
      ) : (
        <Button
          onClick={handleInstallMonitoring}
          disabled={isPending}
          buttonStyle='primary'
          size='medium'>
          Install Monitoring Tools
        </Button>
      )}
    </div>
  )
}

export default InstallMonitoringTools
