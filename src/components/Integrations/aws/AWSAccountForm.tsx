'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import React, { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { connectAWSAccountAction } from '@/actions/cloud/aws'
import { connectAWSAccountSchema } from '@/actions/cloud/aws/validator'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CloudProviderAccount } from '@/payload-types'

type RefetchType = (input: {
  type: 'aws' | 'azure' | 'gcp' | 'digitalocean'
}) => void

const AWSAccountForm = ({
  children,
  account,
  refetch,
}: {
  children: React.ReactNode
  account?: CloudProviderAccount
  refetch: RefetchType
}) => {
  const dialogFooterRef = useRef<HTMLButtonElement>(null)
  const { execute: connectAccount, isPending: connectingAccount } = useAction(
    connectAWSAccountAction,
    {
      onSuccess: ({ data }) => {
        if (data?.id) {
          refetch({ type: 'aws' })
          dialogFooterRef.current?.click()
        }
      },
    },
  )

  const form = useForm<z.infer<typeof connectAWSAccountSchema>>({
    resolver: zodResolver(connectAWSAccountSchema),
    defaultValues: account
      ? {
          name: account.name,
          accessKeyId: account?.awsDetails?.accessKeyId ?? '',
          secretAccessKey: account?.awsDetails?.secretAccessKey ?? '',
        }
      : {
          name: '',
          accessKeyId: '',
          secretAccessKey: '',
        },
  })

  function onSubmit(values: z.infer<typeof connectAWSAccountSchema>) {
    connectAccount({ ...values, id: account?.id })
  }

  return (
    <Dialog
      onOpenChange={() => {
        form.reset()
      }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {account ? 'Edit AWS Account details' : 'Connect AWS Account'}
          </DialogTitle>
          <DialogDescription>
            Connect your AWS account to manage your EC2 instances.
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
              name='accessKeyId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Key ID</FormLabel>
                  <FormControl>
                    <Input {...field} className='rounded-sm' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='secretAccessKey'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Access Key</FormLabel>
                  <FormControl>
                    <Input {...field} className='rounded-sm' />
                  </FormControl>
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

export default AWSAccountForm
