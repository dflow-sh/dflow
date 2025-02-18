'use client'

import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
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

import { createDomainAction } from '@/actions/domain'
import { createDomainSchema } from '@/actions/domain/validator'
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

const DomainForm = () => {
  const [open, setOpen] = useState(false)
  const params = useParams<{ id: string; serviceId: string }>()

  const form = useForm<z.infer<typeof createDomainSchema>>({
    resolver: zodResolver(createDomainSchema),
    defaultValues: {
      serviceId: params.serviceId,
      projectId: params.id,
      certificateType: 'none',
    },
  })

  const { certificateType } = useWatch({ control: form.control })

  const { execute, isPending } = useAction(createDomainAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success("Successfully created domain, It'll be accessible soon!")
        setOpen(false)
        form.reset()
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to create domain: ${error.serverError}`)
    },
  })

  function onSubmit(values: z.infer<typeof createDomainSchema>) {
    console.log(values)
    execute(values)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
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
                name='host'
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
                name='certificateType'
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

              <Card>
                <CardContent className='pt-4'>
                  <h3 className='text-sm font-semibold'>HTTPS</h3>
                  <div className='flex w-full items-center justify-between'>
                    <p className='text-balance text-muted-foreground'>
                      Enable automatic regeneration of SSL certificate
                    </p>

                    <FormField
                      control={form.control}
                      name='autoRegenerateSSL'
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              disabled={certificateType !== 'letsencrypt'}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

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
