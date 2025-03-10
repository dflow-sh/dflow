'use client'

import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateServiceDomainAction } from '@/actions/service'
import { updateServiceDomainSchema } from '@/actions/service/validator'
import {
  Form,
  FormControl,
  FormDescription,
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

const DomainForm = () => {
  const [open, setOpen] = useState(false)
  const params = useParams<{ id: string; serviceId: string }>()

  const form = useForm<z.infer<typeof updateServiceDomainSchema>>({
    resolver: zodResolver(updateServiceDomainSchema),
    defaultValues: {
      id: params.serviceId,
      domain: {
        certificateType: 'none',
        autoRegenerateSSL: false,
        hostname: '',
      },
      operation: 'add',
    },
  })

  const { domain } = useWatch({ control: form.control })

  const { execute, isPending } = useAction(updateServiceDomainAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.info('Added to queue', {
          description: 'Added domain attachment to queue',
        })
        setOpen(false)
        form.reset()
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to attach domain: ${error.serverError}`)
    },
  })

  function onSubmit(values: z.infer<typeof updateServiceDomainSchema>) {
    console.log(values)
    execute(values)
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={state => {
          setOpen(state)
          if (!state) {
            form.reset()
          }
        }}>
        <DialogTrigger asChild>
          <Button>Add Domain</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Domain</DialogTitle>
            <DialogDescription className='sr-only'>
              Add custom domain for your app
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='w-full space-y-8'>
              <FormField
                control={form.control}
                name='domain.hostname'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='domain.certificateType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificate</FormLabel>

                    <Select
                      onValueChange={value => {
                        field.onChange(value)
                      }}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a certificate provider' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='letsencrypt'>Letsencrypt</SelectItem>

                        <SelectItem value='none'>None</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='operation'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between gap-1 rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>
                        Default domain
                      </FormLabel>
                      <FormDescription>
                        This domain will be set as default domain, previously
                        added domains will be removed!
                      </FormDescription>
                    </div>

                    <FormControl>
                      <Switch
                        checked={field.value === 'set'}
                        onCheckedChange={checked => {
                          form.setValue('operation', checked ? 'set' : 'add')
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name='domain.autoRegenerateSSL'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between gap-1 rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>HTTPS</FormLabel>
                      <FormDescription>
                        Enable automatic regeneration of SSL certificate
                      </FormDescription>
                    </div>

                    <FormControl>
                      <Switch
                        disabled={domain?.certificateType !== 'letsencrypt'}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              /> */}

              <DialogFooter>
                <Button disabled={isPending} type='submit'>
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DomainForm
