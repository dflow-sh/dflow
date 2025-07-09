'use client'

import Loader from '../Loader'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Cog } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

import { resetOnboardingAction } from '@/actions/server'

const Danger = ({ serverId }: { serverId: string }) => {
  const { execute: resetOnboarding, isPending: isResetting } = useAction(
    resetOnboardingAction,
    {
      onSuccess: data => {
        if (data.data?.success) {
          toast.success('Onboarding reset successfully')
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
            <Cog className='mt-1.5 h-5 w-5' />
            <div className='flex flex-col gap-0.5'>
              <div className='text-lg font-semibold'>Reset Onboarding</div>
              <p className='text-sm'>
                This will uninstall Dokku and Railpack, and reset onboarding for
                this server.
              </p>
            </div>
          </div>

          <Button
            variant='destructive'
            disabled={isResetting}
            onClick={() => resetOnboarding({ serverId })}>
            {isResetting ? <Loader className='h-4 w-4' /> : 'Reset Onboarding'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Danger
