'use client'

import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Dialog } from '../ui/dialog'
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { ServerType } from '@dflow/core/payload-types-overrides'

import DeleteServerDialog from './DeleteServerDialog'
import ResetOnboardingDialog from './ResetOnboardingDialog'
import ResetServerDialog from './ResetServerDialog'

const Danger = ({ server }: { server: ServerType }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <>
      <Card className='border-destructive/40 bg-destructive/10 hover:border-destructive/60'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-destructive flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5' />
            Danger Zone
          </CardTitle>
          <p className='text-muted-foreground text-sm'>
            These actions are irreversible and will permanently affect your
            server configuration.
          </p>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Reset Onboarding */}
          <div className='bg-background rounded-lg border p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-start gap-3'>
                <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-md'>
                  <RotateCcw className='text-muted-foreground h-5 w-5' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold'>Reset Onboarding</h3>
                  <p className='text-muted-foreground text-sm'>
                    Onboarding will be reset, allowing you to reconfigure server
                    again.
                  </p>
                </div>
              </div>

              <ResetOnboardingDialog>
                <Button variant='destructive'>
                  <RotateCcw className='h-4 w-4' />
                  Reset Onboarding
                </Button>
              </ResetOnboardingDialog>
            </div>
          </div>

          {/* Reset Server Section */}
          <div className='bg-background rounded-lg border p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-start gap-3'>
                <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-md'>
                  <RotateCcw className='text-muted-foreground h-5 w-5' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold'>Reset Server</h3>
                  <p className='text-muted-foreground text-sm'>
                    Uninstalls Dokku and Railpack, clears associated data,
                    removes attached domains, and plugins.
                  </p>
                </div>
              </div>

              <ResetServerDialog>
                <Button variant='destructive'>
                  <RotateCcw className='h-4 w-4' />
                  Reset Server
                </Button>
              </ResetServerDialog>
            </div>
          </div>

          {/* Delete Server Section */}
          <div className='bg-background rounded-lg border p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-start gap-3'>
                <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-md'>
                  <Trash2 className='text-muted-foreground h-5 w-5' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold'>Delete Server</h3>
                  <p className='text-muted-foreground text-sm'>
                    Permanently remove this server and all associated data from
                    your account.
                  </p>
                </div>
              </div>

              <Button
                variant='destructive'
                onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className='mr-2 h-4 w-4' />
                Delete Server
              </Button>
            </div>
          </div>

          <DeleteServerDialog
            server={server}
            open={deleteDialogOpen}
            setOpen={setDeleteDialogOpen}
          />
        </CardContent>
      </Card>

      <Dialog></Dialog>
    </>
  )
}

export default Danger
