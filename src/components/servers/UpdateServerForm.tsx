'use client'

import { Dokku, Linux, Ubuntu } from '../icons'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, ScreenShareOff } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { JSX, SVGProps } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { installDokkuAction, updateServerAction } from '@/actions/server'
import { updateServerSchema } from '@/actions/server/validator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { supportedLinuxVersions } from '@/lib/constants'
import { SshKey } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

const serverType: {
  [key: string]: (props: SVGProps<SVGSVGElement>) => JSX.Element
} = {
  Ubuntu: Ubuntu,
}

const ServerStatus = ({ server }: { server: ServerType }) => {
  const ServerTypeIcon = serverType[server.os.type ?? ''] ?? Linux

  if (!server.sshConnected) {
    return (
      <Alert variant='destructive'>
        <ScreenShareOff className='h-4 w-4' />
        <AlertTitle>SSH connection failed</AlertTitle>
        <AlertDescription>
          Failed to establish connection to server, please check the server
          details
        </AlertDescription>
      </Alert>
    )
  }

  if (!supportedLinuxVersions.includes(server.os.version ?? '')) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Unsupported OS</AlertTitle>
        <AlertDescription>
          {`Dokku doesn't support ${server.os.type} ${server.os.version}, check`}{' '}
          <Link
            className='underline'
            href='https://dokku.com/docs/getting-started/installation/#system-requirements'
            target='_blank'>
            docs
          </Link>
          {` for more details`}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div
      className={`grid ${server.version ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
      <div className='space-y-2'>
        <Label>OS</Label>

        <div className='flex items-center gap-2 text-sm'>
          <ServerTypeIcon fontSize={20} />

          {`${server.os.type} ${server.os.version}`}
        </div>
      </div>

      {server.version && (
        <div className='space-y-2'>
          <Label>Dokku</Label>

          <div className='flex items-center gap-2 text-sm'>
            <Dokku fontSize={20} />

            {server.version}
          </div>
        </div>
      )}
    </div>
  )
}

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
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to update service: ${error.serverError}`)
      },
    },
  )

  const { execute: installDokku, isPending: isInstallingDokku } =
    useAction(installDokkuAction)

  function onSubmit(values: z.infer<typeof updateServerSchema>) {
    updateService(values)
  }

  const dokkuNotInstalled =
    server.sshConnected &&
    supportedLinuxVersions.includes(server.os.version ?? '') &&
    !server.version

  return (
    <div className='space-y-4 rounded bg-muted/30 p-4'>
      <h4 className='text-lg font-semibold'>Server Information</h4>

      <ServerStatus server={server} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-8'>
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

          <div className='flex w-full justify-end gap-3'>
            {dokkuNotInstalled && (
              <Button
                variant='secondary'
                disabled={isInstallingDokku}
                onClick={() => {
                  if (typeof server.sshKey === 'object') {
                    installDokku({
                      host: server.ip,
                      port: server.port,
                      privateKey: server.sshKey.privateKey,
                      username: server.username,
                      serverId: server.id,
                    })
                  }
                }}>
                <Dokku />
                Install Dokku
              </Button>
            )}

            {
              <Button
                type='submit'
                variant='outline'
                disabled={isUpdatingService}>
                Save
              </Button>
            }
          </div>
        </form>
      </Form>
    </div>
  )
}

export default UpdateServerForm
