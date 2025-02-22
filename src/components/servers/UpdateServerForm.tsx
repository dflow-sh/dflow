'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateServerAction } from '@/actions/server'
import { updateServerSchema } from '@/actions/server/validator'
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
import { SshKey } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

const UpdateServerForm = ({
  server,
  sshKeys,
}: {
  server: ServerType
  sshKeys: SshKey[]
}) => {
  const form = useForm<z.infer<typeof updateServerSchema>>({
    resolver: zodResolver(updateServerSchema),
    defaultValues: {
      name: server.name,
      description: server.description ?? '',
      ip: server.ip,
      port: server.port,
      sshKey:
        typeof server.sshKey === 'object' ? server.sshKey.id : server.sshKey,
      username: server.username,
      id: server.id,
    },
  })

  const { execute: updateService, isPending: isUpdatingService } = useAction(
    updateServerAction,
    {
      onSuccess: ({ data, input }) => {
        if (data) {
          toast.success(`Successfully updated ${input.name} service`)
          form.reset()
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to update service: ${error.serverError}`)
      },
    },
  )

  function onSubmit(values: z.infer<typeof updateServerSchema>) {
    updateService(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-8'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>SSH key</FormLabel>

              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormLabel>IP Address</FormLabel>
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
                <FormLabel>Port</FormLabel>
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
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex w-full justify-end'>
          <Button type='submit' variant='outline' disabled={isUpdatingService}>
            Save
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default UpdateServerForm
