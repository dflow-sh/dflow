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
import {
  AlertCircle,
  EllipsisVertical,
  LayoutTemplate,
  Plus,
  SquarePen,
  Trash2,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Fragment, useState } from 'react'
import { toast } from 'sonner'

import {
  deleteTemplateAction,
  publishTemplateAction,
  syncWithPublicTemplateAction,
  unPublishTemplateAction,
} from '@dflow/actions/templates'
import { Card, CardContent } from '@dflow/components/ui/card'
import { CloudProviderAccount, Template, Tenant } from '@dflow/types'

const UnPublishedTemplates = ({
  templates,
  account,
}: {
  templates: Template[]
  account: CloudProviderAccount | undefined
}) => {
  const { organisation } = useParams()
  return (
    <section>
      {templates && templates?.length > 0 ? (
        <div className='mt-4 grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
          {templates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              account={account}
            />
          ))}
        </div>
      ) : (
        <div className='bg-muted/10 rounded-2xl border p-8 text-center shadow-sm'>
          <div className='grid min-h-[20vh] place-items-center'>
            <div>
              <div className='bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
                <LayoutTemplate className='text-muted-foreground h-8 w-8 animate-pulse' />
              </div>

              <div className='my-4'>
                <h3 className='text-foreground text-xl font-semibold'>
                  All templates published
                </h3>
                <p className='text-muted-foreground text-base'>
                  Looks like you have not published any templates
                </p>
              </div>

              <Link
                className='block'
                href={`/${organisation}/templates/compose`}>
                <Button className='mt-2'>
                  <Plus className='h-4 w-4' />
                  Create Template
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

const PublishedTemplates = ({
  templates,
  account,
}: {
  templates: Template[]
  account: CloudProviderAccount | undefined
}) => {
  return (
    <section>
      <h3 className='text-xl font-semibold'>Published Templates</h3>
      <p className='text-muted-foreground mb-6 text-sm'>
        A list of templates published to the dFlow template marketplace
      </p>
      {templates && templates?.length > 0 ? (
        <div className='mt-4 grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
          {templates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              account={account}
            />
          ))}
        </div>
      ) : (
        <div className='bg-muted/10 rounded-2xl border p-8 text-center shadow-sm'>
          <div className='grid min-h-[20vh] place-items-center'>
            <div>
              <div className='bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
                <LayoutTemplate className='text-muted-foreground h-8 w-8 animate-pulse' />
              </div>

              <div className='my-4'>
                <h3 className='text-foreground text-xl font-semibold'>
                  No published templates found
                </h3>
                <p className='text-muted-foreground text-base'>
                  Looks like you have not published any templates
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

const TemplateCard = ({
  template,
  account,
}: {
  template: Template
  account: CloudProviderAccount | undefined
}) => {
  const [open, setOpen] = useState(false)
  const [openPublish, setOpenPublish] = useState(false)

  const router = useRouter()
  const { organisation } = useParams()

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
      onError: ({ error }) => {
        toast.error(`Failed to unpublish template ${error.serverError}`)
      },
    })

  const {
    execute: syncWithPublicTemplate,
    isPending: isSyncWithPublicTemplate,
  } = useAction(syncWithPublicTemplateAction, {
    onSuccess: () => {
      toast.success('Successfully synced with community template')
    },
    onError: ({ error }) => {
      toast.error(
        `Failed to sync with community template ${error?.serverError}`,
      )
    },
  })

  const isPublished = template.isPublished

  const { execute, isPending } = useAction(deleteTemplateAction, {
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
            <Image
              alt='Template Image'
              src={template?.imageUrl || '/images/favicon.ico'}
              width={40}
              height={40}
              className='h-10 w-10 rounded-md'
              unoptimized
            />

            <div className='mt-4 space-y-1'>
              <p className='line-clamp-1 text-lg font-semibold'>
                {template.name}
              </p>
              <p className='text-muted-foreground line-clamp-2 text-sm'>
                {template.description}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className='text-muted-foreground absolute top-4 right-4'>
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
              <DropdownMenuItem
                disabled={!!isPublished}
                onClick={() => setOpen(true)}>
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
              isLoading={isPending}
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
                <Link
                  href={`/${organisation}/integrations?active=dflow`}
                  className='underline'>
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

const PersonalTemplates = ({
  templates,
  accounts,
}: {
  templates: Template[]
  accounts: CloudProviderAccount[] | []
}) => {
  const publishedTemplates = templates.filter(template => template.isPublished)
  const unPublishedTemplates = templates.filter(
    template => !template.isPublished,
  )
  return (
    <div className='space-y-12'>
      <UnPublishedTemplates
        templates={unPublishedTemplates}
        account={accounts?.at(0)}
      />
      <PublishedTemplates
        templates={publishedTemplates}
        account={accounts?.at(0)}
      />
    </div>
  )
}

export default PersonalTemplates
