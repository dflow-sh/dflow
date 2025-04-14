'use client'

import SecretContent from '../ui/blur-reveal'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Copy, Download, Key, Pencil, Plus } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { usePathname, useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  createSSHKeyAction,
  generateSSHKeyAction,
  updateSSHKeyAction,
} from '@/actions/sshkeys'
import { createSSHKeySchema } from '@/actions/sshkeys/validator'
import { DialogFooter } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { SshKey } from '@/payload-types'

// Helper function to determine key type from content
const determineKeyType = (
  keyContent: string,
): 'rsa' | 'ed25519' | 'dsa' | 'ecdsa' => {
  if (!keyContent) return 'rsa' // Default if empty

  const content = keyContent.trim()

  if (content.includes('ssh-rsa')) {
    return 'rsa'
  } else if (content.includes('ssh-ed25519')) {
    return 'ed25519'
  } else if (content.includes('ssh-dss') || content.includes('ssh-dsa')) {
    return 'dsa'
  } else if (content.includes('ecdsa-sha2')) {
    return 'ecdsa'
  }

  // Check for the PEM format header/footer
  if (
    content.includes('BEGIN RSA PRIVATE KEY') ||
    content.includes('BEGIN RSA PUBLIC KEY')
  ) {
    return 'rsa'
  } else if (
    content.includes('BEGIN OPENSSH PRIVATE KEY') &&
    content.includes('ed25519')
  ) {
    return 'ed25519'
  } else if (content.includes('BEGIN DSA PRIVATE KEY')) {
    return 'dsa'
  } else if (content.includes('BEGIN EC PRIVATE KEY')) {
    return 'ecdsa'
  }

  // Default to RSA if can't determine
  return 'rsa'
}

const CreateSSHKeyForm = ({
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
  const [publicKeyCopied, setPublicKeyCopied] = useState(false)
  const [privateKeyCopied, setPrivateKeyCopied] = useState(false)

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

  // Action to generate SSH keys
  const { execute: generateSSHKey, isPending: isGeneratingSSHKey } = useAction(
    generateSSHKeyAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          form.setValue('publicKey', data.publicKey)
          form.setValue('privateKey', data.privateKey)
          toast.success('SSH key pair generated successfully')
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to generate SSH key: ${error.serverError}`)
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

  // Handlers for generating RSA and ED25519 keys
  const handleGenerateRSA = () => {
    generateSSHKey({ type: 'rsa' })
  }

  const handleGenerateED25519 = () => {
    generateSSHKey({ type: 'ed25519' })
  }

  // Handlers for downloading keys
  const downloadKey = (keyType: 'public' | 'private') => {
    const keyContent =
      keyType === 'public'
        ? form.getValues('publicKey')
        : form.getValues('privateKey')
    if (!keyContent) {
      toast.error(`No ${keyType} key to download`)
      return
    }

    // Determine the file extension and base name based on key type
    const generatedType =
      keyType === 'public'
        ? determineKeyType(form.getValues('publicKey'))
        : determineKeyType(form.getValues('privateKey'))

    // Set the base name according to the SSH key type
    let baseName
    switch (generatedType) {
      case 'rsa':
        baseName = 'id_rsa'
        break
      case 'ed25519':
        baseName = 'id_ed25519'
        break
      case 'dsa':
        baseName = 'id_dsa'
        break
      case 'ecdsa':
        baseName = 'id_ecdsa'
        break
      default:
        baseName = 'id_rsa'
    }

    const fileName = keyType === 'public' ? `${baseName}.pub` : baseName

    const blob = new Blob([keyContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(
      `${keyType.charAt(0).toUpperCase() + keyType.slice(1)} key downloaded as ${fileName}`,
    )
  }

  // Copy key to clipboard
  const copyToClipboard = (keyType: 'public' | 'private') => {
    const keyContent =
      keyType === 'public'
        ? form.getValues('publicKey')
        : form.getValues('privateKey')

    if (!keyContent) {
      toast.error(`No ${keyType} key to copy`)
      return
    }

    navigator.clipboard.writeText(keyContent).then(
      () => {
        if (keyType === 'public') {
          setPublicKeyCopied(true)
          setTimeout(() => setPublicKeyCopied(false), 2000)
        } else {
          setPrivateKeyCopied(true)
          setTimeout(() => setPrivateKeyCopied(false), 2000)
        }
        toast.success(
          `${keyType.charAt(0).toUpperCase() + keyType.slice(1)} key copied to clipboard`,
        )
      },
      () => {
        toast.error(`Failed to copy ${keyType} key`)
      },
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-6'>
        {/* Only show generate buttons if not editing */}
        {type === 'create' && (
          <div className='flex flex-col gap-4 sm:flex-row'>
            <Button
              type='button'
              variant='secondary'
              disabled={isGeneratingSSHKey}
              onClick={handleGenerateRSA}
              className='w-full'>
              <Key className='mr-2 h-4 w-4' />
              Generate RSA Key
            </Button>

            <Button
              type='button'
              variant='secondary'
              disabled={isGeneratingSSHKey}
              onClick={handleGenerateED25519}
              className='w-full'>
              <Key className='mr-2 h-4 w-4' />
              Generate ED25519 Key
            </Button>
          </div>
        )}

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
              <div className='flex items-center justify-between'>
                <FormLabel>Public Key</FormLabel>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => copyToClipboard('public')}
                  className='h-8 px-2 text-xs'>
                  {publicKeyCopied ? (
                    <Check className='max-h-[13px] max-w-[13px]' />
                  ) : (
                    <Copy className='max-h-[13px] max-w-[13px]' />
                  )}
                  {publicKeyCopied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <FormControl>
                {type === 'create' ? (
                  <Textarea {...field} />
                ) : (
                  <SecretContent>
                    <Textarea {...field} />
                  </SecretContent>
                )}
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
              <div className='flex items-center justify-between'>
                <FormLabel>Private Key</FormLabel>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => copyToClipboard('private')}
                  className='h-8 px-2 text-xs'>
                  {privateKeyCopied ? (
                    <Check className='max-h-[13px] max-w-[13px]' />
                  ) : (
                    <Copy className='max-h-[13px] max-w-[13px]' />
                  )}
                  {privateKeyCopied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <FormControl>
                {type === 'create' ? (
                  <Textarea {...field} />
                ) : (
                  <SecretContent>
                    <Textarea {...field} />
                  </SecretContent>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className='flex flex-col gap-4 sm:flex-row sm:justify-between'>
          <div className='flex flex-col gap-2 sm:flex-row'>
            <Button
              type='button'
              variant='outline'
              onClick={() => downloadKey('public')}
              className='w-full sm:w-auto'>
              <Download className='mr-2 h-4 w-4' />
              Public Key
            </Button>

            <Button
              type='button'
              variant='outline'
              onClick={() => downloadKey('private')}
              className='w-full sm:w-auto'>
              <Download className='mr-2 h-4 w-4' />
              Private Key
            </Button>
          </div>

          <Button
            type='submit'
            disabled={isCreatingSSHKey || isUpdatingSSHKey}
            className='w-full sm:w-auto'>
            {type === 'create' ? 'Add SSH key' : 'Update SSH key'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

const CreateSSHKey = ({
  type = 'create',
  description = 'This form allows you to add an SSH key manually or generate a new RSA or ED25519 key pair to populate the fields.',
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          // disabled={isDemoEnvironment}
          onClick={e => e.stopPropagation()}
          size={type === 'update' ? 'icon' : 'default'}
          variant={type === 'update' ? 'outline' : 'default'}>
          {type === 'update' ? (
            <>
              <Pencil />
            </>
          ) : (
            <>
              <Plus />
              Add SSH key
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {type === 'update' ? 'Edit SSH Key' : 'Add SSH key'}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <CreateSSHKeyForm type={type} sshKey={sshKey} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  )
}

export default CreateSSHKey
