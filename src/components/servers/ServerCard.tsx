'use client'

import { Button } from '../ui/button'
import { Ellipsis, HardDrive, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { Dispatch, SetStateAction, useState } from 'react'
import { toast } from 'sonner'

import { deleteServerAction } from '@/actions/server'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { isDemoEnvironment } from '@/lib/constants'
import { Server } from '@/payload-types'

export function DeleteServerAlert({
  server,
  open,
  setOpen,
}: {
  server: Server
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) {
  const { id, name } = server

  const { execute } = useAction(deleteServerAction, {
    onExecute: () => {
      setOpen(false)
      toast.loading('Please wait deleting server...', { id })
    },
    onSuccess: ({ data }) => {
      if (data?.deleted) {
        toast.success('Successfully deleted server', { id })
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to delete server: ${error.serverError}`, {
        id,
      })
    },
  })

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            {`Are you sure you want to delete the ${name}?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            variant='destructive'
            onClick={() => {
              execute({
                id: server.id,
              })
            }}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const ServerCard = ({ server }: { server: Server }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Link href={`/servers/${server.id}`} className='h-full'>
        <Card className='h-full min-h-36'>
          <CardHeader className='w-full flex-row items-start justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <HardDrive />
                {server.name}
              </CardTitle>
              <CardDescription>{server.description}</CardDescription>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='!mt-0'
                  disabled={isDemoEnvironment}
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  className='cursor-pointer'
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    setOpen(true)
                  }}>
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          <CardContent>
            <p>{server.ip}</p>
          </CardContent>
        </Card>
      </Link>

      <DeleteServerAlert server={server} open={open} setOpen={setOpen} />
    </>
  )
}

export default ServerCard
