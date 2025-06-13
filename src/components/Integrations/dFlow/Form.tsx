'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, RefreshCw, XCircle } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  checkAccountConnection,
  connectDFlowAccountAction,
} from '@/actions/cloud/dFlow'
import { connectDFlowAccountSchema } from '@/actions/cloud/dFlow/validator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import SecretContent from '@/components/ui/blur-reveal'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CloudProviderAccount } from '@/payload-types'

type RefetchType = (input: {
  type: 'aws' | 'azure' | 'gcp' | 'digitalocean' | 'dFlow'
}) => void

type ConnectionStatus = {
  isConnected: boolean
  error?: string
} | null

const DFlowForm = ({
  children,
  account,
  refetch,
  existingAccountsCount = 0,
}: {
  children: React.ReactNode
  account?: CloudProviderAccount
  refetch?: RefetchType
  existingAccountsCount?: number
}) => {
  const dialogFooterRef = useRef<HTMLButtonElement>(null)
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>(null)
  const [hasTestedConnection, setHasTestedConnection] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Check if user can add new account (only if they have 0 accounts or this is an edit)
  const canAddAccount = account || existingAccountsCount === 0

  const { execute: connectAccount, isPending: connectingAccount } = useAction(
    connectDFlowAccountAction,
    {
      onSuccess: ({ data }) => {
        if (data?.id) {
          refetch?.({ type: 'dFlow' })
          dialogFooterRef.current?.click()
        }
      },
      onError: ({ error }) => {
        if (error?.serverError) {
          setValidationError(error.serverError)
        }

        if (error?.validationErrors) {
          Object.entries(error.validationErrors).forEach(
            ([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                form.setError(
                  field as keyof z.infer<typeof connectDFlowAccountSchema>,
                  {
                    message: messages[0],
                  },
                )
              }
            },
          )
        }
      },
    },
  )

  const { execute: checkConnection, isExecuting: isCheckingConnection } =
    useAction(checkAccountConnection, {
      onSuccess: ({ data }) => {
        setConnectionStatus({
          isConnected: data?.isConnected || false,
          error: data?.error || '',
        })
        setHasTestedConnection(true)
      },
      onError: ({ error }) => {
        setConnectionStatus({
          isConnected: false,
          error: error?.serverError || 'Failed to check account connection',
        })
        setHasTestedConnection(true)
      },
    })

  const form = useForm<z.infer<typeof connectDFlowAccountSchema>>({
    resolver: zodResolver(connectDFlowAccountSchema),
    defaultValues: account
      ? { name: account.name, accessToken: account.dFlowDetails?.accessToken }
      : {
          accessToken: '',
          name: '',
        },
  })

  const handleTestConnection = () => {
    const accessToken = form.getValues('accessToken')
    if (!accessToken.trim()) {
      form.setError('accessToken', {
        message: 'Access token is required to test connection',
      })
      return
    }

    setConnectionStatus(null)
    setHasTestedConnection(false)
    checkConnection({ token: accessToken })
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      setConnectionStatus(null)
      setHasTestedConnection(false)
      setValidationError(null)
    }
  }

  function onSubmit(values: z.infer<typeof connectDFlowAccountSchema>) {
    // Clear previous validation errors
    setValidationError(null)

    if (!hasTestedConnection) {
      handleTestConnection()
      return
    }

    if (!connectionStatus?.isConnected) {
      return
    }

    connectAccount({ ...values, id: account?.id })
  }

  const canSave = hasTestedConnection && connectionStatus?.isConnected
  const showConnectionError =
    hasTestedConnection && !connectionStatus?.isConnected

  // Don't render if user can't add account
  if (!canAddAccount) {
    return null
  }

  return (
    <Dialog onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='space-y-3'>
          <DialogTitle className='text-xl'>
            {account ? 'Edit dFlow Account' : 'Connect dFlow Account'}
          </DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            Connect your dFlow account to deploy servers and access cloud
            features.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Display validation errors from server */}
            {validationError && (
              <Alert variant='destructive'>
                <XCircle className='h-4 w-4' />
                <AlertDescription>
                  <div className='space-y-1'>
                    <p className='font-medium'>Validation Error</p>
                    <p className='text-sm opacity-90'>
                      {validationError.replace('Validation failed: ', '')}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium'>
                      Account Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='My dFlow Account'
                        className='h-10'
                        onChange={e => {
                          field.onChange(e)
                          // Clear validation errors when user starts typing
                          if (validationError) {
                            setValidationError(null)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='accessToken'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium'>
                      Access Token
                    </FormLabel>
                    <FormControl>
                      <SecretContent defaultHide={!!account}>
                        <Input
                          {...field}
                          placeholder='Enter your dFlow access token'
                          className='h-10'
                          onChange={e => {
                            field.onChange(e)
                            // Reset connection status when token changes
                            if (hasTestedConnection) {
                              setConnectionStatus(null)
                              setHasTestedConnection(false)
                            }
                            // Clear validation errors when user starts typing
                            if (validationError) {
                              setValidationError(null)
                            }
                          }}
                        />
                      </SecretContent>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Connection Test Section */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between gap-3'>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-foreground'>
                    Connection Status
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Verify your access token before saving
                  </p>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleTestConnection}
                  disabled={
                    isCheckingConnection ||
                    !form.getValues('accessToken')?.trim()
                  }
                  className='shrink-0'>
                  {isCheckingConnection ? (
                    <>
                      <RefreshCw className='mr-2 h-3 w-3 animate-spin' />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </Button>
              </div>

              {/* Connection Status Display */}
              {isCheckingConnection && (
                <Alert>
                  <RefreshCw className='h-4 w-4 animate-spin' />
                  <AlertDescription>
                    Verifying your dFlow account connection...
                  </AlertDescription>
                </Alert>
              )}

              {connectionStatus?.isConnected && (
                <Alert className='border-emerald-800 bg-emerald-950'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900'>
                      <CheckCircle className='h-4 w-4 text-emerald-400' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-emerald-300'>
                        Connection verified
                      </p>
                      <p className='text-xs text-emerald-400'>
                        Your dFlow account is ready to use
                      </p>
                    </div>
                  </div>
                </Alert>
              )}

              {showConnectionError && (
                <Alert variant='destructive'>
                  <XCircle className='h-4 w-4' />
                  <AlertDescription>
                    <div className='space-y-2'>
                      <p className='font-medium'>Connection failed</p>
                      <p className='text-sm opacity-90'>
                        {connectionStatus?.error}
                      </p>
                      <p className='text-xs opacity-75'>
                        Please verify your access token and try again
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className='flex-col gap-4 sm:flex-row sm:justify-end'>
              <Button
                type='submit'
                isLoading={connectingAccount}
                disabled={connectingAccount || !canSave}>
                {connectingAccount ? (
                  'Saving...'
                ) : !hasTestedConnection ? (
                  'Test Connection First'
                ) : canSave ? (
                  <>
                    <CheckCircle className='mr-2 h-4 w-4' />
                    Save Account
                  </>
                ) : (
                  'Fix Connection Issues'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default DFlowForm
