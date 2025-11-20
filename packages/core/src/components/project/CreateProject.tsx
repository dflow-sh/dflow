'use client'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createProjectAction, updateProjectAction } from '@/actions/project'
import { createProjectSchema } from '@/actions/project/validator'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { slugify } from '@/lib/slugify'
import { Project } from '@/payload-types'

const CreateProject = ({
  servers,
  title = 'Create new project',
  description = 'This will create a new project',
  type = 'create',
  project,
  manualOpen = false,
  setManualOpen = () => {},
  children,
}: {
  servers: {
    id: string
    name: string
    onboarded?: boolean | null | undefined
    connection?:
      | {
          status?: ('success' | 'failed' | 'not-checked-yet') | null
          lastChecked?: string | null
        }
      | undefined
  }[]
  type?: 'create' | 'update'
  title?: string
  description?: string
  project?: Project
  manualOpen?: boolean
  setManualOpen?: Dispatch<SetStateAction<boolean>>
  children?: React.ReactNode
}) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (manualOpen) {
      setOpen(manualOpen)
    }
  }, [manualOpen])

  // if user has only one server, selecting that by-default by checking if onboarding and connection status
  const defaultServerId = useMemo(() => {
    if (servers.length === 1) {
      const { connection, onboarded, id } = servers?.[0]
      const isConnected = connection?.status === 'success'
      const isOnboarded = onboarded === true

      const isAvailable = isConnected && isOnboarded

      if (isAvailable) {
        return id
      }
    }

    return ''
  }, [servers])

  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: project
      ? {
          name: project.name,
          description: project.description ?? '',
          serverId:
            typeof project.server === 'object'
              ? project.server.id
              : project.server,
        }
      : {
          name: '',
          description: '',
          serverId: defaultServerId,
        },
  })

  const { execute: createProject, isPending: isCreatingProject } = useAction(
    createProjectAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          toast.success(`Successfully created project ${data.name}`)
          setOpen(false)
          setManualOpen(false)
          form.reset()
        }
      },
      onError: ({ error }) => {
        if (error.serverError === 'Dokku is not installed!') {
          form.setError('serverId', {
            message: 'Dokku not installed on the server!',
          })
        } else {
          toast.error('Failed to create project', {
            description: error.serverError,
          })
        }
      },
    },
  )

  const { execute: updateProject, isPending: isUpdatingProject } = useAction(
    updateProjectAction,
    {
      onSuccess: ({ data, input }) => {
        if (data) {
          toast.success(`Successfully updated ${input.name} project`)
          setOpen(false)
          setManualOpen(false)
          form.reset()
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to update project: ${error.serverError}`)
      },
    },
  )

  function onSubmit(values: z.infer<typeof createProjectSchema>) {
    if (type === 'create') {
      createProject(values)
    } else if (type === 'update' && project) {
      // passing extra id-field during update operation
      updateProject({ ...values, id: project.id })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={state => {
        setOpen(state)
        setManualOpen(state)
      }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            {description}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={type === 'update'}
                      onChange={e => {
                        e.stopPropagation()
                        e.preventDefault()

                        e.target.value = slugify(e.target.value)
                        field.onChange(e)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      onChange={e => {
                        e.stopPropagation()
                        e.preventDefault()

                        field.onChange(e)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='serverId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server</FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    disabled={type === 'update'}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a server' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      onSelect={e => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}>
                      {servers.map(({ name, id, connection, onboarded }) => {
                        const isConnected = connection?.status === 'success'
                        const isOnboarded = onboarded === true
                        const isAvailable = isConnected && isOnboarded

                        return (
                          <SelectItem
                            key={id}
                            value={id}
                            disabled={!isAvailable}>
                            <div className='flex w-full items-center justify-between'>
                              <span>{name}</span>
                              {!isOnboarded ? (
                                <Badge
                                  variant='warning'
                                  className='ml-2 text-xs'>
                                  Setup Required
                                </Badge>
                              ) : !isConnected ? (
                                <Badge
                                  variant='destructive'
                                  className='ml-2 text-xs'>
                                  Connection error
                                </Badge>
                              ) : null}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='submit'
                isLoading={isCreatingProject || isUpdatingProject}
                disabled={isCreatingProject || isUpdatingProject}>
                {type === 'create' ? 'Create Project' : 'Update Project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateProject
