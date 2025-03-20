'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { usePathname, useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createSSHKeyAction, updateSSHKeyAction } from '@/actions/sshkeys'
import { createSSHKeySchema } from '@/actions/sshkeys/validator'
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
import { SshKey } from '@/payload-types'

export const CreateSSHKeyForm = ({
  type = 'create',
  sshKey,
  setOpen,
}: {
  type?: 'create' | 'update'
  sshKey?: SshKey
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
}) => {
  const pathName = usePathname()
  const router = useRouter()

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

  const { execute: createSSHKey, isPending: isCreatingSSHKey } = useAction(
    createSSHKeyAction,
    {
      onSuccess: ({ data, input }) => {
        if (data) {
          toast.success(`Successfully created ${input.name} SSH key`)
          form.reset()

          if (pathName.includes('onboarding')) {
            router.push('/onboarding/add-server')
          }

          setOpen?.(false)
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to create SSH key: ${error.serverError}`)
      },
    },
  )

  const { execute: updateSSHKey, isPending: isUpdatingSSHKey } = useAction(
    updateSSHKeyAction,
    {
      onSuccess: ({ data, input }) => {
        if (data) {
          toast.success(`Successfully updated ${input.name} SSH key`)
          setOpen?.(false)
          form.reset()
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to update SSH key: ${error.serverError}`)
      },
    },
  )

  function onSubmit(values: z.infer<typeof createSSHKeySchema>) {
    if (type === 'update' && sshKey) {
      updateSSHKey({ id: sshKey.id, ...values })
    } else {
      createSSHKey(values)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-6'>
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
          <Button
            type='submit'
            disabled={isCreatingSSHKey || isUpdatingSSHKey}
            className='mt-6'>
            {type === 'create' ? 'Add SSH key' : 'Update SSH key'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

const CreateSSHKey = ({
  type,
  description = 'This form adds SSH key',
  sshKey,
}: {
  type?: 'create' | 'update'
  description?: string
  sshKey?: SshKey
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
}) => {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={e => e.stopPropagation()}
            variant={type === 'update' ? 'outline' : 'default'}>
            {type === 'update' ? (
              <>
                <Pencil />
                Edit SSH Key
              </>
            ) : (
              <>
                <Plus />
                Add SSH key
              </>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {type === 'update' ? 'Add SSH key' : 'Edit SSH Key'}
            </DialogTitle>
            <DialogDescription className='sr-only'>
              {description}
            </DialogDescription>
          </DialogHeader>

          <CreateSSHKeyForm type={type} sshKey={sshKey} setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateSSHKey
