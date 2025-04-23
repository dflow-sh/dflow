'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import React, { useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { connectDockerRegistryAction } from '@/actions/dockerRegistry'
import { connectDockerRegistrySchema } from '@/actions/dockerRegistry/validator'
import SecretContent from '@/components/ui/blur-reveal'
import { Button } from '@/components/ui/button'
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
  FormDescription,
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
import { DockerRegistry } from '@/payload-types'

const registriesList = [
  {
    label: 'Docker',
    value: 'docker',
  },
  {
    label: 'Github',
    value: 'github',
  },
  {
    label: 'Digitalocean',
    value: 'digitalocean',
  },
  {
    label: 'Quay',
    value: 'quay',
  },
]

const DockerRegistryForm = ({
  children,
  account,
  refetch,
}: {
  children: React.ReactNode
  account?: DockerRegistry
  refetch: () => void
}) => {
  const dialogFooterRef = useRef<HTMLButtonElement>(null)
  const { execute: connectAccount, isPending: connectingAccount } = useAction(
    connectDockerRegistryAction,
    {
      onSuccess: ({ data }) => {
        if (data?.id) {
          refetch()
          dialogFooterRef.current?.click()
        }
      },
    },
  )

  const form = useForm<z.infer<typeof connectDockerRegistrySchema>>({
    resolver: zodResolver(connectDockerRegistrySchema),
    defaultValues: account
      ? account
      : {
          name: '',
          username: '',
          password: '',
          type: 'docker',
        },
  })

  function onSubmit(values: z.infer<typeof connectDockerRegistrySchema>) {
    connectAccount({ ...values, id: account?.id })
  }

  const { type, username, password } = useWatch({ control: form.control })

  return (
    <Dialog
      onOpenChange={() => {
        form.reset()
      }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {account ? 'Edit Registry Account' : 'Connect Registry Account'}
          </DialogTitle>
          <DialogDescription>
            Connect your image registry to deploy private images.
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
                  <FormControl>
                    <Input {...field} className='rounded-sm' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registry type</FormLabel>

                  <Select
                    onValueChange={value => {
                      field.onChange(value)

                      if (account?.type === value) {
                        form.setValue('username', account?.username ?? '')
                        form.setValue('password', account?.password ?? '')
                      } else {
                        // on registry-type change resetting the form fields
                        form.setValue('username', '')
                        form.setValue('password', '')
                      }
                    }}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select registry type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      onSelect={e => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}>
                      {registriesList.map(({ label, value }) => {
                        return (
                          <SelectItem key={value} value={value}>
                            <span className='flex items-center gap-1'>
                              {label}
                            </span>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hiding username for digital-ocean because for it we can use password and username as same */}
            {/* check this docs https://dokku.com/docs/advanced-usage/registry-management/ */}

            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem
                  className={type === 'digitalocean' ? 'hidden' : 'block'}>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    {account ? (
                      <SecretContent defaultHide={!!account}>
                        <Input {...field} className='rounded-sm' />
                      </SecretContent>
                    ) : (
                      <Input {...field} className='rounded-sm' />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <SecretContent defaultHide={!!account}>
                      <Input
                        {...field}
                        onChange={e => {
                          // making username and password same for digitalocean registry
                          if (type === 'digitalocean') {
                            form.setValue('username', e.target.value)
                          }

                          field.onChange(e)
                        }}
                        className='rounded-sm'
                      />
                    </SecretContent>
                  </FormControl>

                  {type === 'digitalocean' && (
                    <FormDescription>Add your API Token</FormDescription>
                  )}

                  {(type === 'github' || type === 'docker') && (
                    <FormDescription>
                      Add your Personal Access Token
                    </FormDescription>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose ref={dialogFooterRef} className='sr-only' />

              <Button
                type='submit'
                className='mt-6'
                disabled={connectingAccount}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default DockerRegistryForm
