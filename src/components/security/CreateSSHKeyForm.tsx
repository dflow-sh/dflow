'use client'

import SecretContent from '../ui/blur-reveal'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Copy, Download, Key } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { usePathname, useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createSSHKeyAction, generateSSHKeyAction } from '@/actions/sshkeys'
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
import { slugify } from '@/lib/slugify'
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
  type?: 'create' | 'view'
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

  // Modified onSubmit to prevent event propagation
  function onSubmit(
    values: z.infer<typeof createSSHKeySchema>,
    event?: React.BaseSyntheticEvent,
  ) {
    // Prevent the event from bubbling up to parent forms
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    createSSHKey(values)
  }

  // Modified button click handlers to prevent event propagation
  const handleGenerateRSA = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    generateSSHKey({ type: 'rsa' })
  }

  const handleGenerateED25519 = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
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

  const handleNameChange = (inputValue: string) => {
    const formattedName = slugify(inputValue)
    form.setValue('name', formattedName, {
      shouldValidate: true,
    })
  }

  const handleDownloadPublic = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    downloadKey('public')
  }

  const handleDownloadPrivate = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    downloadKey('private')
  }

  const handleCopyPublic = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    copyToClipboard('public')
  }

  const handleCopyPrivate = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    copyToClipboard('private')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={e => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit(values => {
            createSSHKey(values)
          })()
        }}
        className='w-full space-y-6'>
        {/* Only show generate buttons if creating */}
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
                <Input
                  {...field}
                  disabled={type === 'view'}
                  onChange={e => handleNameChange(e.target.value)}
                />
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
                <Textarea {...field} disabled={type === 'view'} />
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
                  onClick={handleCopyPublic}
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
                <SecretContent defaultHide={type === 'view'}>
                  <Textarea {...field} disabled={type === 'view'} />
                </SecretContent>
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
                  onClick={handleCopyPrivate}
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
                <SecretContent defaultHide={type === 'view'}>
                  <Textarea {...field} disabled={type === 'view'} />
                </SecretContent>
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
              onClick={handleDownloadPublic}
              className='w-full sm:w-auto'>
              <Download className='mr-2 h-4 w-4' />
              Public Key
            </Button>

            <Button
              type='button'
              variant='outline'
              onClick={handleDownloadPrivate}
              className='w-full sm:w-auto'>
              <Download className='mr-2 h-4 w-4' />
              Private Key
            </Button>
          </div>

          {type === 'create' && (
            <Button
              type='submit'
              disabled={isCreatingSSHKey}
              className='w-full sm:w-auto'>
              Add SSH key
            </Button>
          )}
        </DialogFooter>
      </form>
    </Form>
  )
}

export default CreateSSHKeyForm
