import { Skeleton } from '../../ui/skeleton'
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Server,
  XCircle,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useState } from 'react'

import { checkAccountConnection } from '@/actions/cloud/dFlow'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

import { useDflowVpsForm } from './DflowVpsFormProvider'

export const AccountConnectionStatus = () => {
  const { selectedAccount } = useDflowVpsForm()
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean
    error?: string
  } | null>(null)

  const { execute: checkConnection, isPending: isCheckingConnection } =
    useAction(checkAccountConnection, {
      onSuccess: ({ data }) => {
        setConnectionStatus({
          isConnected: data?.isConnected || false,
          error: data?.error || '',
        })
      },
      onError: ({ error }) => {
        setConnectionStatus({
          isConnected: false,
          error: error?.serverError || 'Failed to check account connection',
        })
      },
    })

  useEffect(() => {
    if (selectedAccount) {
      checkConnection({ token: selectedAccount.token })
    }
  }, [selectedAccount?.id, checkConnection])

  const getConnectionStatusIcon = () => {
    if (!connectionStatus) return null

    return connectionStatus.isConnected ? (
      <CheckCircle className='mt-0.5 h-5 w-5 text-green-600' />
    ) : (
      <XCircle className='mt-0.5 h-5 w-5 text-red-600' />
    )
  }

  const getConnectionStatusVariant = () => {
    if (!connectionStatus) return 'default'
    return connectionStatus.isConnected ? 'default' : 'destructive'
  }

  const handleRetry = () => {
    if (selectedAccount) {
      checkConnection({ token: selectedAccount.token })
    }
  }

  return (
    <div className='space-y-3'>
      {isCheckingConnection ? (
        <div className='flex items-center gap-3 rounded-md border p-4'>
          <Skeleton className='h-4 w-4 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-48' />
            <Skeleton className='h-3 w-32' />
          </div>
        </div>
      ) : connectionStatus ? (
        <Alert variant={getConnectionStatusVariant()}>
          <div className='flex items-start gap-3'>
            {getConnectionStatusIcon()}
            <div className='flex-1 space-y-2'>
              <div className='flex items-center gap-4 text-sm'>
                <div className='flex items-center gap-2'>
                  <Server className='h-4 w-4' />
                  <span>
                    {connectionStatus.isConnected
                      ? 'Account connected successfully'
                      : 'Account connection failed'}
                  </span>
                </div>
              </div>

              {!connectionStatus.isConnected && (
                <AlertDescription className='text-sm'>
                  <div className='mb-2'>{connectionStatus.error}</div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleRetry}
                    className='gap-2'>
                    <RefreshCw className='h-4 w-4' />
                    Retry Connection Check
                  </Button>
                </AlertDescription>
              )}
            </div>
          </div>
        </Alert>
      ) : (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Unable to check account connection status. Please try again later.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
