'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { connectDFlowAccountAction } from '@/actions/cloud/dFlow'
import { connectDFlowAccountSchema } from '@/actions/cloud/dFlow/validator'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CloudProviderAccount } from '@/payload-types'

type RefetchType = (input: {
  type: 'aws' | 'azure' | 'gcp' | 'digitalocean' | 'dFlow'
}) => void

const DFlowForm = ({
  children,
  account,
  refetch,
}: {
  children: React.ReactNode
  account?: CloudProviderAccount
  refetch?: RefetchType
}) => {
  const dialogFooterRef = useRef<HTMLButtonElement>(null)
  const { execute: connectAccount, isPending: connectingAccount } = useAction(
    connectDFlowAccountAction,
    {
      onSuccess: ({ data }) => {
        if (data?.id) {
          refetch?.({ type: 'dFlow' })
          dialogFooterRef.current?.click()
        }
      },
    },
  )

  const form = useForm<z.infer<typeof connectDFlowAccountSchema>>({
    resolver: zodResolver(connectDFlowAccountSchema),
    defaultValues: account
      ? account
      : {
          accessToken: '',
          name: '',
        },
  })

  function onSubmit(values: z.infer<typeof connectDFlowAccountSchema>) {
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
            {account ? 'Edit dFlow Account' : 'Connect dFlow Account'}
          </DialogTitle>
          <DialogDescription>
            Connect your dFlow account to deploy servers & access cloud features
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
              name='accessToken'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Token</FormLabel>
                  <FormControl>
                    <SecretContent defaultHide={!!account}>
                      <Input {...field} className='rounded-sm' />
                    </SecretContent>
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
                isLoading={connectingAccount}
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

export default DFlowForm
