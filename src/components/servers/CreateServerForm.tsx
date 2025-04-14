'use client'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Pencil, Plus } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { usePathname, useRouter } from 'next/navigation'
import { Options, parseAsString, useQueryState } from 'nuqs'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createServerAction, updateServerAction } from '@/actions/server'
import { createServerSchema } from '@/actions/server/validator'
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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { isDemoEnvironment } from '@/lib/constants'
import { cloudProvidersList } from '@/lib/integrationList'
import { SecurityGroup, SshKey } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

import CreateEC2InstanceForm from './CreateEC2InstanceForm'

const ServerSelectionForm = ({
  setType,
  type,
}: {
  setType: (
    value: string | ((old: string) => string | null) | null,
    options?: Options,
  ) => Promise<URLSearchParams>
  type: string
}) => {
  const [cloudProvider, setCloudProvider] = useState(type)

  return (
    <>
      <div>
        <h3 className='font-semibold'>Cloud Providers</h3>
        <p className='mb-4 text-muted-foreground'>
          Create a server on your preferred cloud provider
        </p>

        <RadioGroup
          className='grid-cols-4 gap-4'
          onValueChange={value => setCloudProvider(value)}>
          {cloudProvidersList.map(({ label, Icon, live, slug }) => {
            return (
              <div
                key={label}
                className='has-data-[state=checked]:border-ring shadow-xs relative flex flex-col gap-4 rounded-md border border-input p-4 outline-none'>
                <div className='flex justify-between gap-2'>
                  <RadioGroupItem
                    id={slug}
                    value={slug}
                    disabled={!live}
                    className='order-1 after:absolute after:inset-0'
                  />

                  <Icon className='size-7' />
                </div>

                <Label htmlFor={slug}>{label}</Label>
                {!live && (
                  <Badge className='w-max' variant={'outline'}>
                    Coming Soon
                  </Badge>
                )}
              </div>
            )
          })}
        </RadioGroup>

        <Button
          className='mt-4 w-full'
          disabled={!cloudProvider}
          onClick={() => setType(cloudProvider)}>
          Continue
          <ArrowRight />
        </Button>
      </div>

      <div className='relative mt-4 grid place-items-center border-t'>
        <p className='inline-block -translate-y-3 px-4'>Or</p>
      </div>

      <Button
        variant='outline'
        className='w-full'
        onClick={() => {
          setType('manual')
        }}>
        Attach Server Details
      </Button>
    </>
  )
}

export function ServerForm({
  sshKeys,
  securityGroups,
  server,
  setOpen,
  type: formType,
}: {
  sshKeys: SshKey[]
  securityGroups: SecurityGroup[]
  type?: 'create' | 'update'
  server?: ServerType
  setOpen?: Dispatch<SetStateAction<boolean>>
}) {
  const [type, setType] = useQueryState('type', parseAsString.withDefault(''))

  useEffect(() => {
    return () => {
      setType('')
    }
  }, [])

  if (type === 'aws') {
    return (
      <CreateEC2InstanceForm
        sshKeys={sshKeys}
        setOpen={setOpen}
        securityGroups={securityGroups}
      />
    )
  }

  if (type === 'manual') {
    return (
      <CreateServerForm
        sshKeys={sshKeys}
        server={server}
        type={formType}
        setOpen={setOpen}
      />
    )
  }

  return <ServerSelectionForm type={type} setType={setType} />
}

export const CreateServerForm = ({
  sshKeys,
  type = 'create',
  server,
  setOpen = () => {},
}: {
  sshKeys: SshKey[]
  type?: 'create' | 'update'
  server?: ServerType
  setOpen?: Dispatch<SetStateAction<boolean>>
}) => {
  const [_type, setType] = useQueryState('type', parseAsString.withDefault(''))

  const pathName = usePathname()
  const router = useRouter()
  const isOnboarding = pathName.includes('onboarding')

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
        if (data) {
          toast.success(`Successfully created ${input.name} server`, {
            description:
              isOnboarding && 'redirecting to dokku-installation page...',
          })

          setOpen(false)
          form.reset()

          if (isOnboarding) {
            router.push('/onboarding/dokku-install')
          }
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to create service: ${error.serverError}`)
      },
    },
  )

  const { execute: updateServer, isPending: isUpdatingServer } = useAction(
    updateServerAction,
    {
      onSuccess: ({ data, input }) => {
        if (data) {
          toast.success(`Successfully updated ${input.name} service`)
          setOpen(false)
          form.reset()
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to update service: ${error.serverError}`)
      },
    },
  )

  function onSubmit(values: z.infer<typeof createServerSchema>) {
    if (type === 'create') {
      createServer(values)
    } else if (type === 'update' && server) {
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
                <FormLabel>Name</FormLabel>
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

          <DialogFooter className='mt-6'>
            <Button variant='outline' onClick={() => setType(null)}>
              <ArrowLeft />
              Go back
            </Button>

            <Button
              type='submit'
              disabled={isCreatingServer || isUpdatingServer}>
              {type === 'create' ? 'Add Server' : 'Update Server'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}

// Using same form for create & update operations
const CreateServer = ({
  sshKeys,
  securityGroups,
  title = 'Add Server',
  type = 'create',
  server,
}: {
  sshKeys: SshKey[]
  securityGroups: SecurityGroup[]
  type?: 'create' | 'update'
  title?: string
  server?: ServerType
}) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={isDemoEnvironment}
          size={type === 'update' ? 'icon' : 'default'}
          variant={type === 'update' ? 'outline' : 'default'}>
          {type === 'update' ? (
            <>
              <Pencil />
            </>
          ) : (
            <>
              <Plus />
              Add Server
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className='w-full max-w-4xl'>
        <DialogHeader className='mb-2'>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            {type === 'update' ? 'Update Server Details' : 'Attach Server'}
          </DialogDescription>
        </DialogHeader>

        <ServerForm
          sshKeys={sshKeys}
          securityGroups={securityGroups}
          server={server}
          type={type}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  )
}

export default CreateServer
