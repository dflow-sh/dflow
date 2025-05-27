'use client'

import { Button } from '../ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowUpDown } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  getCloudProvidersAccountsAction,
  syncDflowServersAction,
} from '@/actions/cloud'
import { syncDflowServersSchema } from '@/actions/cloud/validator'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SyncDFlow = () => {
  const [open, setOpen] = useState(false)
  const form = useForm<z.infer<typeof syncDflowServersSchema>>({
    resolver: zodResolver(syncDflowServersSchema),
  })

  const {
    execute,
    isPending: isFetchingAccounts,
    result,
  } = useAction(getCloudProvidersAccountsAction)

  const { execute: syncDflowServers, isPending: isSyncingDflow } = useAction(
    syncDflowServersAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data?.message || 'Servers synced successfully')
        setOpen(false)
        form.reset()
      },
      onError: ({ error }) => {
        toast.error(error.serverError || 'Failed to sync servers')
      },
    },
  )

  useEffect(() => {
    execute({ type: 'dFlow' })
  }, [])

  function onSubmit(values: z.infer<typeof syncDflowServersSchema>) {
    syncDflowServers({ id: values.id })
  }

  const accounts = result?.data || []
  return (
    <Dialog
      open={open}
      onOpenChange={state => {
        if (isSyncingDflow) {
          return
        }

        setOpen(state)
      }}>
      <DialogTrigger asChild>
        <Button variant={'outline'}>
          <ArrowUpDown />
          Sync from dFlow
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync from dFlow</DialogTitle>
          <DialogDescription>
            Sync sever details of your dFlow account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name='id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select
                    disabled={isFetchingAccounts || !accounts.length}
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className='h-max text-left'>
                        <SelectValue
                          placeholder={
                            isFetchingAccounts
                              ? 'Fetching Accounts...'
                              : accounts.length
                                ? 'Select a account'
                                : 'No accounts found'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {/* todo: add disabled state for database services if plugin is not installed */}
                      {accounts?.map(({ id, name }) => {
                        return (
                          <SelectItem value={id} key={id}>
                            {name}
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
                isLoading={isSyncingDflow}
                disabled={isFetchingAccounts || isSyncingDflow}>
                Sync
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default SyncDFlow
