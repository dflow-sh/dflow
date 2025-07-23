'use client'

import Loader from '../Loader'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { BrushCleaning } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

import { resetOnboardingAction } from '@/actions/server'
import { ServerType } from '@/payload-types-overrides'

const Danger = ({ server }: { server: ServerType }) => {
  const {
    execute: resetOnboarding,
    isPending: isResetting,
    hasSucceeded: hasResetOnboarded,
  } = useAction(resetOnboardingAction, {
    onSuccess: data => {
      if (data.data?.success) {
        toast.success('Onboarding reset triggered', {
          description:
            'This will uninstall both Dokku and Railpack, and reset onboarding for this server.',
        })
      }
    },
    onError: error => {
      toast.error(error.error.serverError)
    },
  })

  return (
    <Card className='border-destructive/50 bg-destructive/30 hover:border-destructive/70'>
      <CardHeader>
        <CardTitle className='font-medium'>Danger Zone</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between'>
          <div className='flex items-start gap-1.5'>
            <BrushCleaning className='mt-1.5 h-5 w-5' />
            <div className='flex flex-col gap-0.5'>
              <div className='text-lg font-semibold'>Reset Onboarding</div>
              <p className='text-sm text-muted-foreground'>
                Uninstalls Dokku and Railpack, clears associated data, removes
                attached domains, and plugins.
              </p>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className='border-destructive/50 bg-destructive/70 text-destructive-foreground hover:bg-destructive/80'
                variant='outline'
                disabled={
                  isResetting || !server.sshConnected || hasResetOnboarded
                }>
                {isResetting ? <Loader className='h-4 w-4' /> : 'Reset'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset Onboarding</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                This will uninstall Dokku and Railpack, and reset onboarding for
                this server.
              </DialogDescription>
              <DialogFooter>
                <Button
                  variant='destructive'
                  disabled={
                    isResetting || !server.sshConnected || hasResetOnboarded
                  }
                  onClick={() => resetOnboarding({ serverId: server.id })}>
                  Reset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

export default Danger
