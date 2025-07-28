'use client'

import DeleteProjectDialog from '../DeleteProjectDialog'
import { Button } from '../ui/button'
import { AlertTriangle, Settings2, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Project, Service } from '@/payload-types'

const ProjectSettingsTab: React.FC<{
  services: Service[]
  project: Partial<Project>
}> = ({ services, project }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-1.5'>
        <Settings2 />
        <h4 className='text-lg font-semibold'>Project Settings</h4>
      </div>

      {/* Danger Zone */}
      <Card className='border-destructive/40 bg-destructive/10 hover:border-destructive/60'>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-2 text-destructive'>
            <AlertTriangle className='h-5 w-5' />
            Danger Zone
          </CardTitle>
          <p className='text-sm text-muted-foreground'>
            These actions are irreversible and will permanently affect your
            project configuration.
          </p>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Delete Project Section */}
          <div className='rounded-lg border bg-background p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-start gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-md bg-muted'>
                  <Trash2 className='h-5 w-5 text-muted-foreground' />
                </div>
                <div className='flex-1 space-y-1'>
                  <h3 className='font-semibold'>Delete Project</h3>
                  <p className='text-sm text-muted-foreground'>
                    Permanently remove this project and all associated data,
                    services, and configurations from your account.
                  </p>
                  <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                    <AlertTriangle className='h-3 w-3' />
                    This action cannot be undone and will delete all project
                    data
                  </div>
                </div>
              </div>
              <Button
                variant='destructive'
                onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className='mr-2 h-4 w-4' />
                Delete Project
              </Button>
            </div>
          </div>

          <DeleteProjectDialog
            project={project}
            open={deleteDialogOpen}
            setOpen={setDeleteDialogOpen}
            services={services}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default ProjectSettingsTab
