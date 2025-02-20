'use client'

import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createProjectAction, updateProjectAction } from '@/actions/project'
import { createProjectSchema } from '@/actions/project/validator'
import {
  Dialog,
  DialogClose,
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
import { supportedLinuxVersions } from '@/lib/constants'
import { Project } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

const CreateProject = ({
  servers,
  children,
  title = 'Create new project',
  description = 'This will create a new project',
  type = 'create',
  project,
}: {
  servers: ServerType[]
  children: React.ReactNode
  type?: 'create' | 'update'
  title?: string
  description?: string
  project?: Project
}) => {
  // Instead of using state passing ref to dialog-close & creating a click event on server-action success
  const dialogRef = useRef<HTMLButtonElement>(null)

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
      : {},
  })

  const { execute: createProject, isPending: isCreatingProject } = useAction(
    createProjectAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          toast.success(`Successfully created project ${data.name}`)
          const dialogClose = dialogRef.current
          if (dialogClose) {
            dialogClose.click()
          }

          form.reset()
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

          const dialogClose = dialogRef.current
          if (dialogClose) {
            dialogClose.click()
          }

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
    <div className='grid place-items-end'>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className='sr-only'>
              {description}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
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
                        {servers.map(({ name, id, os, sshConnected }) => {
                          const disabled = !supportedLinuxVersions.includes(
                            os.version ?? '',
                          )

                          const disabledMessage = () => {
                            if (!sshConnected) {
                              return 'Failed to connect to server, please check your server-details'
                            }

                            if (disabled) {
                              return `Dokku doesn't support ${os.type} ${os.version}, please check dokku documentation`
                            }
                          }

                          return (
                            <SelectItem disabled={disabled} key={id} value={id}>
                              <span className='flex items-center gap-1'>
                                {name}
                              </span>

                              <p>{disabledMessage()}</p>
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
                <DialogClose ref={dialogRef} className='sr-only' />

                <Button
                  type='submit'
                  disabled={isCreatingProject || isUpdatingProject}>
                  {type === 'create' ? 'Create Project' : 'Update Project'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateProject
