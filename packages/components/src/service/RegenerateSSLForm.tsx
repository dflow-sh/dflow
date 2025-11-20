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
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { regenerateSSLAction } from '@/actions/service'
import { regenerateSSLSchema } from '@/actions/service/validator'
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

const RegenerateSSLForm = () => {
  const [open, setOpen] = useState(false)
  const { serviceId } = useParams<{ serviceId: string }>()

  const form = useForm<z.infer<typeof regenerateSSLSchema>>({
    resolver: zodResolver(regenerateSSLSchema),
    defaultValues: {
      id: serviceId,
    },
  })

  const { execute: regenerate, isPending: isRegenerating } = useAction(
    regenerateSSLAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.info('Added to queue', {
            description: `Added regenerating SSL certificates to queue`,
          })

          form.reset()
          setOpen(false)
        }
      },
      onError: ({ error }) => {
        toast.error(
          `Failed to regenerate SSL certificates: ${error.serverError}`,
        )
      },
    },
  )

  const onSubmit = async (data: z.infer<typeof regenerateSSLSchema>) => {
    // Call the action to regenerate SSL certificates
    regenerate(data)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={state => {
        if (isRegenerating) return
        setOpen(state)
      }}>
      <DialogTrigger asChild>
        <Button variant='secondary'>
          <FileText />
          Regenerate SSL Certificates
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Regenerate SSL Certificates</DialogTitle>
          <DialogDescription className='sr-only'>
            This will regenerate SSL Certificates for all domains.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='w-full space-y-6'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='Email' {...field} />
                  </FormControl>

                  <FormDescription>
                    This email will be used for certificate expiration
                    generation, if not specified global email will be used.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='submit'
                isLoading={isRegenerating}
                disabled={isRegenerating}>
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default RegenerateSSLForm
