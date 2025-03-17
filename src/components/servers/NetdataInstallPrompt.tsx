'use client'

import { RefreshCcw } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { installNetdataAction } from '@/actions/netdata'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ServerType } from '@/payload-types-overrides'

const NetdataInstallPrompt = ({ server }: { server: ServerType }) => {
  const router = useRouter()

  const { execute: installNetdata, isPending: isInstallingNetdata } = useAction(
    installNetdataAction,
    {
      onSuccess: () => {
        toast.success('Successfully installed netdata')
        router.refresh()
      },
    },
  )

  const handleInstall = () => {
    installNetdata({ serverId: server.id })
  }

  return (
    <>
      <Alert variant='destructive'>
        <RefreshCcw className='h-4 w-4' />
        <AlertTitle>Netdata is not installed!</AlertTitle>
        <AlertDescription className='flex w-full flex-col justify-between gap-2 md:flex-row'>
          <p>Netdata is required for monitoring. Install it to proceed.</p>
          <Button
            disabled={false}
            onClick={() => {
              handleInstall()
            }}>
            Install Netdata
          </Button>
        </AlertDescription>
      </Alert>
    </>
  )
}

export default NetdataInstallPrompt
