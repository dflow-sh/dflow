'use client'

import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { useRouter } from '@bprogress/next'
import { AlertCircle, EllipsisVertical, SquarePen, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { Fragment, useState } from 'react'
import { toast } from 'sonner'

import {
  deleteTemplate,
  publishTemplateAction,
  syncWithPublicTemplateAction,
  unPublishTemplateAction,
} from '@/actions/templates'
import { Card, CardContent } from '@/components/ui/card'
import { CloudProviderAccount, Template, Tenant } from '@/payload-types'

const TemplateDetails = ({
  template,
  account,
}: {
  template: Template
  account: CloudProviderAccount | undefined
}) => {
  const [open, setOpen] = useState(false)
  const [openPublish, setOpenPublish] = useState(false)

  const router = useRouter()

  const { execute: publishTemplate, isPending: isPublishTemplatePending } =
    useAction(publishTemplateAction, {
      onSuccess: ({ data }) => {
        if (data) {
          setOpenPublish(false)
        }
      },
      onError: ({ error }) => {
        toast.error(
          `Failed publish template, ${error?.serverError && error.serverError}`,
        )
      },
    })

  const { execute: unPublishTemplate, isPending: isUnPublishTemplatePending } =
    useAction(unPublishTemplateAction, {
      onSuccess: ({ data }) => {
        if (data) {
          setOpenPublish(false)
        }
      },
      onError: () => {
        toast.error('Failed to unpublish template')
      },
    })

  const {
    execute: syncWithPublicTemplate,
    isPending: isSyncWithPublicTemplate,
  } = useAction(syncWithPublicTemplateAction, {
    onSuccess: () => {
      toast.success('Successfully synced with community template')
    },
    onError: () => {
      toast.error('Failed to sync with community template')
    },
  })

  const isPublished = template.isPublished

  const { execute, isPending } = useAction(deleteTemplate, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success(`Template deleted successfully`)
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to delete template: ${error.serverError}`)
    },
  })

  return (
    <Fragment>
      <Card>
        <CardContent className='relative flex h-56 flex-col justify-between p-6'>
          <div>
            <img
              alt='Template Image'
              src={template?.imageUrl || '/images/favicon.ico'}
              className='h-10 w-10 rounded-md'
            />

            <div className='mt-4 space-y-1'>
              <p className='line-clamp-1 text-lg font-semibold'>
                {template.name}
              </p>
              <p className='line-clamp-2 text-sm text-muted-foreground'>
                {template.description}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className='absolute right-4 top-4 text-muted-foreground'>
              <EllipsisVertical size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/${(template?.tenant as Tenant)?.slug}/templates/compose?templateId=${template?.id}&type=personal`,
                  )
                }>
                <SquarePen size={20} />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <Trash2 size={20} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className='mt-6 flex items-end justify-end gap-3'>
            <Button
              onClick={() => setOpenPublish(true)}
              variant={isPublished ? 'destructive' : 'default'}>
              {isPublished ? 'Unpublish' : 'Publish'}
            </Button>
            {isPublished && (
              <Button
                onClick={() =>
                  syncWithPublicTemplate({
                    accountId: account?.id ?? '',
                    templateId: template.id,
                  })
                }
                isLoading={isSyncWithPublicTemplate}>
                Sync
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action is
              permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={isPending}
              onClick={() => {
                execute({ id: template.id, accountId: account?.id ?? '' })
              }}
              variant='destructive'>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openPublish} onOpenChange={setOpenPublish}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isPublished ? 'Unpublish' : 'Publish'} Template
            </DialogTitle>
            <DialogDescription>
              {isPublished
                ? 'Remove this template from the community deployment list. It will no longer be available for public use.'
                : 'Make this template available for community deployment. Others will be able to discover and deploy it directly.'}
            </DialogDescription>
          </DialogHeader>
          {!account && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Integration Required</AlertTitle>
              <AlertDescription>
                To {isPublished ? 'unpublish' : 'publish'} this template, you
                must first connect your{' '}
                <Link href='/dashboard/integrations' className='underline'>
                  dFlow
                </Link>{' '}
                account in the Integrations section.
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            {isPublished ? (
              <Button
                variant={'destructive'}
                onClick={() =>
                  unPublishTemplate({
                    templateId: template.id,
                    accountId: account?.id ?? '',
                  })
                }
                isLoading={isUnPublishTemplatePending}
                disabled={!account || isUnPublishTemplatePending}>
                Unpublish
              </Button>
            ) : (
              <Button
                variant={'default'}
                onClick={() =>
                  publishTemplate({
                    templateId: template.id,
                    accountId: account?.id!,
                  })
                }
                isLoading={isPublishTemplatePending}
                disabled={isPublishTemplatePending || !account}>
                Publish
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}

export default TemplateDetails
