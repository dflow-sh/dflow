'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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

const subdomainSchema = z.object({
  domain: z
    .string()
    .regex(
      /^(?![^.]+\.[^.]+$)([a-zA-Z0-9-]+)\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Invalid subdomain format',
    ),
})

const DomainForm = () => {
  const form = useForm<z.infer<typeof subdomainSchema>>({
    resolver: zodResolver(subdomainSchema),
    defaultValues: {
      domain: '',
    },
  })

  function onSubmit(values: z.infer<typeof subdomainSchema>) {
    console.log({ values })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={e => e.stopPropagation()} variant='outline'>
          Add Domain
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Domain</DialogTitle>
          <DialogDescription>
            <ul className='list-inside list-disc'>
              <li>
                Please attach a subdomain example:{' '}
                <strong className='text-foreground'>app.mydomain.com</strong>
              </li>
            </ul>
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

            <DialogFooter>
              <Button type='submit'>Add</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default DomainForm
