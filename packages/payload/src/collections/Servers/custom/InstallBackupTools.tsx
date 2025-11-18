'use client'

import { toast } from '@payloadcms/ui'
import { Button } from '@payloadcms/ui/elements/Button'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'

import { serverBackupAdminAction } from '@dflow/actions/backups'

const InstallMonitoringTools = () => {
  const params = useParams<{ segments: string[] }>()

  const { execute, isPending, hasSucceeded, result } = useAction(
    serverBackupAdminAction,
    {
      onError: ({ error }) => {
        toast.error(`Failed to install backup tools: ${error?.serverError}`)
      },
    },
  )

  const handleInstallMonitoring = () => {
    execute({ serverId: params?.segments?.at(-1) || '' })
  }

  const backupToolsMessage = useMemo(() => {
    if (isPending) {
      return 'Installing backup tools...'
    }

    if (hasSucceeded) {
      if (result?.data?.installation) {
        return 'Backup tools installed'
      }

      return 'Triggered backup tools installation'
    } else {
      return 'Install Backup Tools'
    }
  }, [hasSucceeded, result, isPending])

  return (
    <Button
      onClick={handleInstallMonitoring}
      disabled={isPending || hasSucceeded}
      buttonStyle='secondary'
      size='medium'>
      {backupToolsMessage}
    </Button>
  )
}

export default InstallMonitoringTools
