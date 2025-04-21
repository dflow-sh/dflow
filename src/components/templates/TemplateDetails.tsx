'use client'

import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

import { deleteTemplate } from '@/actions/templates'
import { Card, CardContent } from '@/components/ui/card'
import { Template } from '@/payload-types'

const TemplateDetails = ({ template }: { template: Template }) => {
  const { execute, isPending } = useAction(deleteTemplate, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success(`Successfully deleted template`)
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to delete template: ${error.serverError}`)
    },
  })
  return (
    <Card>
      <CardContent className='flex h-24 w-full items-center justify-between gap-3 pt-4'>
        <div className='flex items-center gap-3'>
          <div>
            <p className='font-semibold'>{template.name}</p>
            <span className='text-sm text-muted-foreground'>
              {template?.description}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          {/* <UpdateSSHKey
                    sshKey={sshKey}
                    type='update'
                    description='This form updates SSH key'
                  /> */}

          <Button
            disabled={isPending}
            onClick={() => {
              execute({ id: template.id })
            }}
            size='icon'
            variant='outline'>
            <Trash2 size={20} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default TemplateDetails
