'use client'

import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
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
import { zodResolver } from '@hookform/resolvers/zod'
import { env } from 'env'
import { Info, Plus } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateServiceDomainAction } from '@/actions/service'
import { updateServiceDomainSchema } from '@/actions/service/validator'
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

const DomainForm = ({ ip }: { ip: string }) => {
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
        default: false,
      },
      operation: 'add',
    },
  })

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
    const isWildCardDomain = values.domain.hostname.endsWith(
      env.NEXT_PUBLIC_PROXY_DOMAIN_URL ?? ' ',
    )

    // restricting domain addition when ip is 999.999.999.999
    // and domain added shouldn't be proxy domain
    if (ip === '999.999.999.999' && !isWildCardDomain) {
      return toast.warning(
        `server has no public-IP assigned, domain can't be attached`,
        {
          duration: 7000,
        },
      )
    }

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
          <Button>
            <Plus />
            Add Domain
          </Button>
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
              className='w-full space-y-6'>
              <Alert variant='info'>
                <Info className='h-4 w-4' />
                <AlertTitle>
                  Domain environment variables of this service will be updated
                  automatically
                </AlertTitle>

                <AlertDescription>
                  Other services using these variables should be updated
                  manually.
                </AlertDescription>
              </Alert>

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
                        <SelectItem value='none'>None</SelectItem>
                        <SelectItem value='letsencrypt'>Letsencrypt</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name='domain.default'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between gap-1 rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>DEFAULT</FormLabel>
                      <FormDescription>
                        This will be used as the default domain
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
              /> */}

              {/* The environment variables
              of this service will be updated automatically.
              <br />
              <b>Note:</b> Other services using these environment variables will
              not be updated automatically—you will need to update them
              manually. */}

              <DialogFooter>
                <Button
                  disabled={isPending}
                  isLoading={isPending}
                  type='submit'>
                  Add
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
