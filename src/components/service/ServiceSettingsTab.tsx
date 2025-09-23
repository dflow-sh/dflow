'use client'

import { Button } from '../ui/button'
import { AlertTriangle, Repeat, Settings2, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Project, Service } from '@/payload-types'

import DeleteServiceDialog from './DeleteServiceDialog'
import SwitchServiceProjectDialog from './SwitchServiceProjectDialog'

const ServiceSettingsTab: React.FC<{
  service: Service
  project: Project
}> = ({ service, project }) => {
  const [switchProjectDialogOpen, serSwitchProjectDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-1.5'>
        <Settings2 />
        <h4 className='text-lg font-semibold'>Service Settings</h4>
      </div>

      {/* Switch service */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-start gap-3'>
              <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-md'>
                <Repeat className='text-muted-foreground h-5 w-5' />
              </div>
              <div className='flex-1 space-y-1'>
                <h3 className='font-semibold'> Switch Service</h3>
                <p className='text-muted-foreground text-sm'>
                  Switch between different projects on the same server without
                  needing to reconfigure settings or restart services
                </p>
              </div>
            </div>
            <Button
              variant='secondary'
              onClick={() => serSwitchProjectDialogOpen(true)}>
              <Repeat className='mr-2 h-4 w-4' />
              Switch Service
            </Button>
          </div>
          <SwitchServiceProjectDialog
            open={switchProjectDialogOpen}
            project={project}
            service={service}
            setOpen={serSwitchProjectDialogOpen}
          />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className='border-destructive/40 bg-destructive/10 hover:border-destructive/60'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-destructive flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5' />
            Danger Zone
          </CardTitle>
          <p className='text-muted-foreground text-sm'>
            These actions are irreversible and will permanently affect your
            service configuration.
          </p>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Delete Service Section */}
          <div className='bg-background rounded-lg border p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-start gap-3'>
                <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-md'>
                  <Trash2 className='text-muted-foreground h-5 w-5' />
                </div>
                <div className='flex-1 space-y-1'>
                  <h3 className='font-semibold'>Delete Service</h3>
                  <p className='text-muted-foreground text-sm'>
                    Permanently remove this service and all associated data,
                    configurations, and deployments.
                  </p>
                  <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                    <AlertTriangle className='h-3 w-3' />
                    This action cannot be undone and will delete all service
                    data
                  </div>
                </div>
              </div>
              <Button
                variant='destructive'
                onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className='mr-2 h-4 w-4' />
                Delete Service
              </Button>
            </div>
          </div>

          <DeleteServiceDialog
            service={service}
            project={project}
            open={deleteDialogOpen}
            setOpen={setDeleteDialogOpen}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default ServiceSettingsTab
