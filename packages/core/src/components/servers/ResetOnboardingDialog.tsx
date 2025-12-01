import { AlertTriangle } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { type ReactNode, useState } from 'react'

import { resetServerOnboardingAction } from '@dflow/core/actions/server'
import { Button } from '@dflow/core/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@dflow/core/components/ui/dialog'

const ResetOnboardingDialog = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const params = useParams<{ serverId: string }>()
  const { execute, isPending } = useAction(resetServerOnboardingAction, {
    // onSuccess, close the dialog
    onSuccess: () => {
      setIsOpen(false)
    },
  })

  return (
    <Dialog
      open={isOpen}
      onOpenChange={state => {
        if (isPending) {
          return
        }

        setIsOpen(state)
      }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <AlertTriangle className='text-destructive h-5 w-5' />
            Reset Onboarding
          </DialogTitle>

          <DialogDescription>
            This will reset the onboarding process, allowing you to reconfigure
            your server from scratch.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='secondary' disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>

          <Button
            variant='destructive'
            disabled={isPending}
            isLoading={isPending}
            onClick={() => {
              execute({ serverId: params.serverId })
            }}>
            Reset Onboarding
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ResetOnboardingDialog
