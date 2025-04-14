'use client'

import { Badge } from '../ui/badge'
import { AlertTriangle, Info, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface SyncItem {
  id: string
  name: string
  type: 'SecurityGroup' | 'SSHKey'
  status: 'pending' | 'failed' | 'outOfSync'
}

interface SyncBannerProps {
  unsyncedItems: SyncItem[]
  onSyncAll: () => Promise<{ success: boolean; results: SyncItem[] }>
}

export function SyncBanner({ unsyncedItems, onSyncAll }: SyncBannerProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSyncAll = async () => {
    setIsSyncing(true)
    try {
      await onSyncAll()
      setIsDialogOpen(false)
    } finally {
      setIsSyncing(false)
    }
  }

  if (!unsyncedItems.length) return null

  return (
    <>
      <Alert variant='destructive' className='mb-6'>
        <AlertTriangle className='h-4 w-4' />
        <AlertDescription className='flex items-center gap-2'>
          <span>
            {unsyncedItems.length} item{unsyncedItems.length > 1 ? 's' : ''} not
            synced with AWS
          </span>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='h-auto px-2 py-1 text-sm'>
                <Info className='mr-1 h-3 w-3' />
                View Changes
              </Button>
            </DialogTrigger>

            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Unsynced Changes</DialogTitle>
                <DialogDescription>
                  The following items need to be synced with your AWS account
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className='max-h-[60vh]'>
                <div className='space-y-4 pr-4'>
                  {unsyncedItems.map(item => (
                    <div
                      key={item.id}
                      className='flex items-center justify-between rounded border p-4'>
                      <div>
                        <h4 className='font-medium'>{item.name}</h4>
                        <p className='text-sm text-muted-foreground'>
                          {item.type}
                        </p>
                      </div>
                      <Badge
                        variant='outline'
                        className={cn({
                          'border-yellow-500 text-yellow-500':
                            item.status === 'outOfSync',
                          'border-red-500 text-red-500':
                            item.status === 'failed',
                          'border-blue-500 text-blue-500':
                            item.status === 'pending',
                        })}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <DialogFooter>
                <Button onClick={handleSyncAll} disabled={isSyncing}>
                  {isSyncing && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {isSyncing ? 'Syncing...' : 'Sync All'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </AlertDescription>
      </Alert>
    </>
  )
}
