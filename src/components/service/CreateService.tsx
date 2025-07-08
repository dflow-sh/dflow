'use client'

import {
  Docker,
  Git,
  MariaDB,
  MongoDB,
  MySQL,
  PostgreSQL,
  Redis,
} from '../icons'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Database, Plus } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Fragment, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createServiceAction } from '@/actions/service'
import { createServiceSchema } from '@/actions/service/validator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { slugify } from '@/lib/slugify'
import { Server } from '@/payload-types'

const databaseOptions = [
  {
    label: 'Postgres',
    value: 'postgres',
    icon: PostgreSQL,
  },
  {
    label: 'MongoDB',
    value: 'mongo',
    icon: MongoDB,
  },
  {
    label: 'MySQL',
    value: 'mysql',
    icon: MySQL,
  },
  {
    label: 'MariaDB',
    value: 'mariadb',
    icon: MariaDB,
  },
  {
    label: 'Redis',
    value: 'redis',
    icon: Redis,
  },
]

const CreateService = ({
  server,
  project,
  disableCreateButton = false,
  disableReason = 'Cannot create service at this time',
}: {
  server: Server
  project: { name: string }
  disableCreateButton?: boolean
  disableReason?: string
}) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const params = useParams<{ id: string; organisation: string }>()
  const { plugins = [] } = server

  const projectName = project.name ? slugify(project.name) : ''

  const { execute, isPending } = useAction(createServiceAction, {
    onSuccess: ({ data, input }) => {
      if (data?.success) {
        if (data.redirectUrl) {
          router.push(data?.redirectUrl)
        }
        toast.success(`Redirecting to ${input.name} service page...`)
        setOpen(false)
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to create service: ${error.serverError}`)
    },
  })

  const form = useForm<z.infer<typeof createServiceSchema>>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: '',
      projectId: params.id,
    },
  })

  const { type } = useWatch({ control: form.control })

  const handleNameChange = (inputValue: string) => {
    const serviceSpecificName = slugify(inputValue)

    form.setValue('name', serviceSpecificName, {
      shouldValidate: true,
    })
  }

  function onSubmit(values: z.infer<typeof createServiceSchema>) {
    execute(values)
  }

  const createButton = (
    <Button
      disabled={disableCreateButton}
      className='disabled:cursor-not-allowed'>
      <Plus className='mr-2' />
      Create Service
    </Button>
  )

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={state => {
          setOpen(state)
          if (!state) {
            form.reset()
          }
        }}>
        {disableCreateButton ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>{createButton}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{disableReason}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <DialogTrigger asChild>{createButton}</DialogTrigger>
        )}

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new service</DialogTitle>
            <DialogDescription className='sr-only'>
              This will create a new service
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='w-full space-y-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <div className='space-y-2'>
                      <p className='text-sm text-gray-500'>
                        Service will be named:{' '}
                        <span className='font-semibold'>{projectName}-</span>
                        <span className='italic'>[your-input]</span>
                      </p>

                      <FormControl>
                        <div className='grid grid-cols-[auto_1fr]'>
                          {projectName && (
                            <div className='flex h-full items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-muted-foreground'>
                              {`${projectName}-`}
                            </div>
                          )}

                          <Input
                            {...field}
                            value={field.value.replace(`${projectName}-`, '')}
                            onChange={e => handleNameChange(e.target.value)}
                            className={projectName ? 'rounded-l-none' : ''}
                          />
                        </div>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='app'>
                          <div className='flex items-center gap-1.5'>
                            <Git className='size-4' />
                            App (Git based application)
                          </div>
                        </SelectItem>

                        <SelectItem value='docker'>
                          <div className='flex items-center gap-1.5'>
                            <Docker className='size-4 text-blue-500' />
                            Docker
                          </div>
                        </SelectItem>

                        <SelectItem value='database'>
                          <div className='flex items-center gap-1.5'>
                            <Database size={16} className='text-blue-500' />
                            Database
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {type === 'database' && (
                <FormField
                  control={form.control}
                  name='databaseType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database</FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a type' />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className='mb-2 inline-block w-[calc(var(--radix-select-trigger-width)-16px)] text-wrap font-normal'>
                              To deploy database which are disabled, please
                              enable appropriate plugin on{' '}
                              <Link
                                className='text-primary underline'
                                href={`/${params.organisation}/servers/${server.id}?tab=plugins`}>
                                server
                              </Link>
                            </SelectLabel>
                          </SelectGroup>

                          {databaseOptions.map(
                            ({ label, value, icon: Icon }) => {
                              const optionDisabled =
                                !plugins ||
                                !plugins.find(
                                  plugin => plugin.name === value,
                                ) ||
                                plugins.find(plugin => plugin.name === value)
                                  ?.status === 'disabled'

                              return (
                                <Fragment key={value}>
                                  <SelectItem
                                    value={value}
                                    disabled={optionDisabled}>
                                    <span className='flex gap-2'>
                                      <Icon className='size-5' />
                                      {label}
                                    </span>
                                  </SelectItem>
                                </Fragment>
                              )
                            },
                          )}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type='submit'
                  disabled={isPending}
                  isLoading={isPending}>
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateService
