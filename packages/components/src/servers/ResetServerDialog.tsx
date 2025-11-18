import { AlertTriangle } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { type ReactNode, useState } from 'react'
import { toast } from 'sonner'

import { resetServerAction } from '@dflow/actions/server'
import { Button } from '@dflow/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@dflow/components/ui/dialog'

const ResetServerDialog = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const params = useParams<{ serverId: string }>()

  const { execute, isPending } = useAction(resetServerAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.info('Added reset server to queue', {
          description: 'This may take a few minutes, check server logs',
          duration: 8000,
        })
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to reset server: ${error?.serverError}`)
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
            Reset Server
          </DialogTitle>

          <DialogDescription>
            Uninstalls Dokku and Railpack, clears associated data, removes
            attached domains, and plugins. This process is irreversible!
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
            Reset Server
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ResetServerDialog
