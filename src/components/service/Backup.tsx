'use client'

import { ComingSoonBadge } from '../ComingSoonBadge'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/check-box'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  ChevronDown,
  Cloud,
  DatabaseBackup,
  Server,
  Trash2,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  internalBackupAction,
  internalDbDeleteAction,
  internalRestoreAction,
} from '@/actions/dbBackup'
import { Backup as BackupType, Service } from '@/payload-types'

export const IndividualBackup = ({
  backup,
  serviceId,
  showRestoreIcon = true,
  showDeleteIcon = true,
}: {
  backup: BackupType
  serviceId: string
  showRestoreIcon?: boolean
  showDeleteIcon?: boolean
}) => {
  const {
    execute: internalRestoreExecution,
    isPending: isInternalRestorePending,
  } = useAction(internalRestoreAction, {
    onExecute: () => {
      toast.loading('Restoring backup...', {
        id: 'restore-backup',
      })
    },
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success('Added to queue', {
          id: 'restore-backup',
          description: 'Added backup restoration to queue',
        })
      }
    },
    onError: () => {
      toast.error('Restore Failed', {
        id: 'restore-backup',
        description: 'There was an error restoring the backup',
      })
    },
  })

  const {
    execute: internalDeleteExecution,
    isPending: isInternalDeletePending,
  } = useAction(internalDbDeleteAction, {
    onExecute: () => {
      toast.loading('Deleting backup...', {
        id: 'delete-backup',
      })
    },
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success('Added to queue', {
          id: 'delete-backup',
          description: 'Added backup deletion to queue',
        })
      }
    },
    onError: () => {
      toast.error('Delete Failed', {
        id: 'delete-backup',
        description: 'There was an error deleting the backup',
      })
    },
  })

  const backupCreatedDate = new Date(backup.createdAt)

  const formattedDate = [
    backupCreatedDate.getUTCFullYear(),
    String(backupCreatedDate.getUTCMonth() + 1).padStart(2, '0'),
    String(backupCreatedDate.getUTCDate()).padStart(2, '0'),
    String(backupCreatedDate.getUTCHours()).padStart(2, '0'),
    String(backupCreatedDate.getUTCMinutes()).padStart(2, '0'),
    String(backupCreatedDate.getUTCSeconds()).padStart(2, '0'),
  ].join('-')

  return (
    <div className='flex items-center justify-between rounded-md border p-4'>
      <div className='flex items-center gap-2'>
        <DatabaseBackup size={16} className='stroke-muted-foreground' />
        <div className='text-sm font-medium'>{formattedDate}</div>
        <Badge
          className=''
          variant={
            backup.status === 'failed'
              ? 'destructive'
              : backup.status === 'in-progress'
                ? 'warning'
                : ('success' as 'success' | 'destructive' | 'warning')
          }>
          {backup.status}
        </Badge>
      </div>
      <div className='flex items-center gap-2'>
        {showRestoreIcon && (
          <Button
            variant='outline'
            // size='icon'
            disabled={isInternalRestorePending}
            onClick={() =>
              internalRestoreExecution({ backupId: backup.id, serviceId })
            }>
            {/* <History size={16} /> */}
            Restore
          </Button>
        )}
        {showDeleteIcon && (
          <Button
            variant='outline'
            size='icon'
            onClick={() => {
              internalDeleteExecution({
                backupId: backup.id,
                serviceId,
                databaseName: '',
                databaseType: '',
              })
            }}>
            <Trash2 size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}

const Backup = ({
  databaseDetails,
  serviceId,
  backups,
}: {
  databaseDetails: Service['databaseDetails']
  serviceId: string
  backups: BackupType[]
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const { execute: internalDBBackupExecution, isPending: isInternalDBPending } =
    useAction(internalBackupAction, {
      onExecute: () => {
        toast.loading('Creating backup...', {
          id: 'create-backup',
        })
      },
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success('Added to queue', {
            id: 'create-backup',
            description: 'Added backup creation to queue',
          })
        }
      },
      onError: () => {
        toast.error('Backup Failed', {
          id: 'create-backup',
          description: 'There was an error creating the backup',
        })
      },
    })

  return (
    <>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-semibold'>Backups</h2>
        <div className='flex items-center gap-2'>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant={'outline'}>Create backup schedule</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure backup schedule</DialogTitle>
                <DialogDescription>
                  Enable database backups for your applications.
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4'>
                <div className='text-sm text-muted-foreground'>
                  Available schedules
                </div>
                <div className='flex items-center gap-x-4 space-x-2 rounded-md border p-2'>
                  <Checkbox />
                  <div>
                    <div>Daily</div>
                    <div className='text-sm text-muted-foreground'>
                      Backed up every 24 hours, kept for 6 days.
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-x-4 space-x-2 rounded-md border p-2'>
                  <Checkbox />
                  <div>
                    <div>Weekly</div>
                    <div className='text-sm text-muted-foreground'>
                      Backed up every 7 day, kept for 1 month.
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-x-4 space-x-2 rounded-md border p-2'>
                  <Checkbox />
                  <div>
                    <div>Monthly</div>
                    <div className='text-sm text-muted-foreground'>
                      Backed up every 30 days, kept for 3 months.
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant={'outline'}
                  onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button disabled className='cursor-not-allowed'>
                  Save schedule (Coming soon...)
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={'outline'}
                disabled={
                  databaseDetails?.status !== 'running' || isInternalDBPending
                }
                className='flex items-center gap-2'>
                Create Backup
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                className='cursor-pointer hover:text-background'
                onClick={() =>
                  internalDBBackupExecution({
                    serviceId,
                  })
                }>
                <div
                  className='flex size-8 items-center justify-center'
                  aria-hidden='true'>
                  <Server size={16} className='opacity-60' />
                </div>
                <div>
                  <div className='text-sm font-medium'>Internal Backup</div>
                  <div className='text-xs opacity-60'>
                    Creates backup within the server
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <div
                  className='flex size-8 items-center justify-center'
                  aria-hidden='true'>
                  <Cloud size={16} className='opacity-60' />
                </div>
                <ComingSoonBadge position='top-right'>
                  <div>
                    <div className='text-sm font-medium'>External Backup</div>
                    <div className='text-xs opacity-60'>
                      Creates backup in cloud storage (AWS S3, GCP, etc.)
                    </div>
                  </div>
                </ComingSoonBadge>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {backups.length === 0 ? (
        <div className='flex h-72 flex-col items-center justify-center'>
          <DatabaseBackup className='stroke-muted-foreground' />
          <div>No Backups</div>
          <p className='font-light text-muted-foreground'>
            This service's volumes do not have any backups available.
          </p>
        </div>
      ) : (
        <div className='mt-4 flex flex-col gap-2'>
          {backups.map(backup => (
            <IndividualBackup
              key={backup.id}
              backup={backup}
              serviceId={serviceId}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default Backup
