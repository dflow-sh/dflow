'use client'

import SidebarToggleButton from '../SidebarToggleButton'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { parseAsString, useQueryState } from 'nuqs'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createServerAction, updateServerAction } from '@/actions/server'
import { createServerSchema } from '@/actions/server/validator'
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Server, SshKey } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

const AttachCustomServerForm = ({
  sshKeys,
  formType = 'create',
  server,
  onSuccess,
  onError,
}: {
  sshKeys: SshKey[]
  formType?: 'create' | 'update'
  server?: ServerType
  onSuccess?: (
    data:
      | {
          success: boolean
          server: Server
        }
      | undefined,
  ) => void
  onError?: (error: any) => void
}) => {
  const [_type] = useQueryState('type', parseAsString.withDefault(''))

  const form = useForm<z.infer<typeof createServerSchema>>({
    resolver: zodResolver(createServerSchema),
    defaultValues: server
      ? {
          name: server.name,
          description: server.description ?? '',
          ip: server.ip,
          port: server.port,
          sshKey:
            typeof server.sshKey === 'object'
              ? server.sshKey.id
              : server.sshKey,
          username: server.username,
        }
      : {
          name: '',
          description: '',
          ip: '',
          port: 22,
          sshKey: '',
          username: '',
        },
  })

  const { execute: createServer, isPending: isCreatingServer } = useAction(
    createServerAction,
    {
      onSuccess: ({ data, input }) => {
        if (data?.success) {
          toast.success(`Successfully created ${input.name} server`, {
            description: `Redirecting to server-details page`,
          })

          form.reset()
        }

        onSuccess?.(data)
      },
      onError: ({ error }) => {
        toast.error(`Failed to create service: ${error.serverError}`)

        onError?.(error)
      },
    },
  )

  const { execute: updateServer, isPending: isUpdatingServer } = useAction(
    updateServerAction,
    {
      onSuccess: ({ data, input }) => {
        if (data?.success) {
          toast.success(`Successfully updated ${input.name} service`)
          form.reset()
        }

        onSuccess?.(data)
      },
      onError: ({ error }) => {
        toast.error(`Failed to update service: ${error.serverError}`)

        onError?.(error)
      },
    },
  )

  function onSubmit(values: z.infer<typeof createServerSchema>) {
    if (formType === 'create') {
      createServer(values)
    } else if (formType === 'update' && server) {
      // passing extra id-field during update operation
      updateServer({ ...values, id: server.id })
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-6'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name
                  <SidebarToggleButton
                    directory='servers'
                    fileName='attach-server'
                    sectionId='#name'
                  />
                </FormLabel>
                <FormControl>
                  <Input {...field} className='rounded-sm' />
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
                <FormLabel>
                  Description
                  <SidebarToggleButton
                    directory='servers'
                    fileName='attach-server'
                    sectionId='#description-optional'
                  />
                </FormLabel>{' '}
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='sshKey'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  SSH key
                  <SidebarToggleButton
                    directory='servers'
                    fileName='attach-server'
                    sectionId='#ssh-key'
                  />
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a SSH key' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sshKeys.map(({ name, id }) => (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='ip'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  IP Address
                  <SidebarToggleButton
                    directory='servers'
                    fileName='attach-server'
                    sectionId='#ip-address'
                  />
                </FormLabel>{' '}
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='port'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Port
                    <SidebarToggleButton
                      directory='servers'
                      fileName='attach-server'
                      sectionId='#port'
                    />
                  </FormLabel>{' '}
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      onChange={e => {
                        form.setValue('port', +e.target.value, {
                          shouldValidate: true,
                        })
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Username
                    <SidebarToggleButton
                      directory='servers'
                      fileName='attach-server'
                      sectionId='#username'
                    />
                  </FormLabel>{' '}
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='flex w-full items-center justify-end'>
            <Button
              type='submit'
              disabled={isCreatingServer || isUpdatingServer}>
              {formType === 'create' ? 'Add Server' : 'Update Server'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

export default AttachCustomServerForm
