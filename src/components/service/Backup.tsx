'use client'

import { ComingSoonBadge } from '../ComingSoonBadge'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
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
  History,
  Server,
  Trash2,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

import { internalBackupAction, internalRestoreAction } from '@/actions/dbBackup'
import { Backup as BackupType, Service } from '@/payload-types'

const IndividualBackup = ({
  backup,
  serviceId,
}: {
  backup: BackupType
  serviceId: string
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

  const backupCreatedDate = new Date(backup.createdAt)

  const formattedDate = [
    backupCreatedDate.getFullYear(),
    String(backupCreatedDate.getMonth() + 1).padStart(2, '0'),
    String(backupCreatedDate.getDate()).padStart(2, '0'),
    String(backupCreatedDate.getHours()).padStart(2, '0'),
    String(backupCreatedDate.getMinutes()).padStart(2, '0'),
    String(backupCreatedDate.getSeconds()).padStart(2, '0'),
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
        <Button
          variant='ghost'
          size='icon'
          disabled={isInternalRestorePending}
          onClick={() =>
            internalRestoreExecution({ backupId: backup.id, serviceId })
          }>
          <History size={16} />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => {
            toast.error('This feature is not available yet', {
              description: 'You cannot delete backups yet',
            })
          }}>
          <Trash2 size={16} />
        </Button>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
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
