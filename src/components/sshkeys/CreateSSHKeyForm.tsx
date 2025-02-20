'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createSSHKeyAction } from '@/actions/sshkeys'
import { createSSHKeySchema } from '@/actions/sshkeys/validator'
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
import { SshKey } from '@/payload-types'

const CreateSSHKeyForm = ({
  children,
  type = 'create',
  description = 'This will add a new SSH key',
  sshKey,
  title = 'Add SSH key',
}: {
  children: React.ReactNode
  type?: 'create' | 'update'
  title?: string
  description?: string
  sshKey?: SshKey
}) => {
  const dialogRef = useRef<HTMLButtonElement>(null)

  const form = useForm<z.infer<typeof createSSHKeySchema>>({
    resolver: zodResolver(createSSHKeySchema),
    defaultValues: sshKey
      ? {
          name: sshKey.name,
          description: sshKey.description ?? '',
          privateKey: sshKey.privateKey,
          publicKey: sshKey.publicKey,
        }
      : {
          name: '',
          description: '',
          privateKey: '',
          publicKey: '',
        },
  })

  const { execute, isPending } = useAction(createSSHKeyAction, {
    onSuccess: ({ data, input }) => {
      if (data) {
        toast.success(`Successfully created ${input.name} SSH key`)

        const dialogClose = dialogRef.current

        if (dialogClose) {
          dialogClose.click()
        }

        form.reset()
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to create SSH key: ${error.serverError}`)
    },
  })

  function onSubmit(values: z.infer<typeof createSSHKeySchema>) {
    execute(values)
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className='sr-only'>
              {description}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='w-full space-y-8'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='publicKey'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Public Key</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='privateKey'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Private Key</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose ref={dialogRef} className='sr-only' />

                <Button type='submit' disabled={isPending}>
                  {type === 'create' ? 'Add SSH key' : 'Update SSH key'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateSSHKeyForm
