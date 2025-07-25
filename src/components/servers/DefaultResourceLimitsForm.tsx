'use client'

import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { updateServerAction } from '@/actions/server'
import { updateServerSchema } from '@/actions/server/validator'
import { Server } from '@/payload-types'

const DefaultResourceLimitsForm = ({ server }: { server: Server }) => {
  const [pending, setPending] = useState(false)
  const isServerConnected = server.connection?.status === 'success'

  const form = useForm<{
    cpu: string
    memory: string
  }>({
    resolver: zodResolver(
      updateServerSchema.pick({
        defaultResourceLimits: true,
        id: true,
      }),
    ),
    defaultValues: {
      cpu: server.defaultResourceLimits?.cpu || '',
      memory: server.defaultResourceLimits?.memory || '',
    },
  })

  const { execute } = useAction(updateServerAction, {
    onSuccess: () => {
      toast.success('Default resource limits updated!')
      setPending(false)
    },
    onError: error => {
      toast.error('Failed to update resource limits', {
        description: error?.error?.serverError,
      })
      setPending(false)
    },
  })

  const onSubmit = (values: { cpu: string; memory: string }) => {
    setPending(true)
    execute({
      id: server.id,
      name: server.name || '',
      ip: server.ip || '',
      port: server.port ?? 22,
      username: server.username || '',
      sshKey:
        typeof server.sshKey === 'object'
          ? server.sshKey?.id || ''
          : server.sshKey || '',
      description: server.description || '',
      defaultResourceLimits: {
        cpu: values.cpu,
        memory: values.memory,
      },
    })
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Default Resource Limits</CardTitle>
        <CardDescription>
          Set the default CPU and Memory limits for new services created on this
          server. These can be overridden per service after creation.
          {!isServerConnected && (
            <span className='mt-1 block text-destructive'>
              You cannot update resource limits while the server is
              disconnected.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='cpu'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default CPU Limit</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='e.g. 500m, 1, 2'
                        disabled={pending || !isServerConnected}
                      />
                    </FormControl>
                    <p className='text-xs text-muted-foreground'>
                      Set the default CPU limit for new services (e.g., 500m, 1,
                      2).
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='memory'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Memory Limit</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='e.g. 512M, 1G'
                        disabled={pending || !isServerConnected}
                      />
                    </FormControl>
                    <p className='text-xs text-muted-foreground'>
                      Set the default memory limit for new services (e.g., 512M,
                      1G).
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                type='submit'
                disabled={pending || !isServerConnected}
                isLoading={pending}>
                Save Resource Limits
              </Button>
            </div>
          </form>
        </Form>
        <Separator className='my-4' />
        <div className='space-y-2 text-xs text-muted-foreground'>
          <div>
            <strong>Examples:</strong>
          </div>
          <div>
            <code className='rounded bg-muted px-1'>500m</code> = 0.5 CPU core,{' '}
            <code className='rounded bg-muted px-1'>1</code> = 1 CPU core
          </div>
          <div>
            <code className='rounded bg-muted px-1'>512M</code> = 512 MB RAM,{' '}
            <code className='rounded bg-muted px-1'>1G</code> = 1 GB RAM
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DefaultResourceLimitsForm
