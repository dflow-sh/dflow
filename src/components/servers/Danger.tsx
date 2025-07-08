'use client'

import { Dokku } from '../icons'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

import { uninstallDokkuAction } from '@/actions/server'

const Danger = ({ serverId }: { serverId: string }) => {
  const { execute: uninstallDokku, isPending: isUninstallingDokku } = useAction(
    uninstallDokkuAction,
    {
      onSuccess: data => {
        if (data.data?.success) {
          toast.success('Dokku uninstalled successfully')
        }
      },
      onError: error => {
        toast.error(error.error.serverError)
      },
    },
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-destructive'>Danger Zone</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between'>
          <div className='flex items-start gap-1.5'>
            <Dokku className='mt-1.5 h-5 w-5' />
            <div className='flex flex-col gap-0.5'>
              <div className='text-lg font-semibold'>Uninstall Dokku</div>
              <p className='text-sm'>
                This will remove Dokku from your server.
              </p>
            </div>
          </div>

          <Button
            variant='destructive'
            disabled={isUninstallingDokku}
            onClick={() => uninstallDokku({ serverId })}>
            {isUninstallingDokku ? 'Uninstalling...' : 'Uninstall'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Danger
