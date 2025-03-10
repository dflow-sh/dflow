'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateServerDomainAction } from '@/actions/server'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ServerType } from '@/payload-types-overrides'

const subdomainSchema = z.object({
  domain: z
    .string()
    .regex(
      /^(?![^.]+\.[^.]+$)([a-zA-Z0-9-]+)\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Invalid subdomain format',
    ),
  defaultDomain: z.boolean().optional().default(true),
})

const DomainForm = ({ server }: { server: ServerType }) => {
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof subdomainSchema>>({
    resolver: zodResolver(subdomainSchema),
    defaultValues: {
      domain: '',
      defaultDomain: true,
    },
  })

  const { execute, isPending } = useAction(updateServerDomainAction, {
    onSuccess: ({ input, data }) => {
      if (data?.success) {
        setOpen(false)
        form.reset()
        toast.info('Added to queue', {
          description: `Added domain ${input.domain} to server ${server.name}`,
        })
      }
    },
  })

  function onSubmit(values: z.infer<typeof subdomainSchema>) {
    execute({
      operation: values.defaultDomain ? 'set' : 'add',
      id: server.id,
      domain: values.domain,
    })
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button onClick={e => e.stopPropagation()}>Add Domain</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Domain</DialogTitle>
          <DialogDescription>
            Please attach a subdomain example:{' '}
            <strong className='text-foreground'>app.mydomain.com</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='w-full space-y-8'>
            <FormField
              control={form.control}
              name='domain'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='defaultDomain'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between gap-1 rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Default domain</FormLabel>
                    <FormDescription>
                      App&apos;s created from now on this server will be
                      assigned this domain
                    </FormDescription>
                  </div>

                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='submit' disabled={isPending}>
                Add
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default DomainForm
