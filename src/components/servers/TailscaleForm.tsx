'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle,
  Copy,
  Key,
  RefreshCw,
  Shield,
  Terminal,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator'
import { z } from 'zod'

import {
  checkServerConnection,
  createTailscaleServerAction,
} from '@/actions/server'
import { createTailscaleServerSchema } from '@/actions/server/validator'
import {
  generateOAuthClientSecretAction,
  getOAuthClientSecretAction,
} from '@/actions/tailscale'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

type TailscaleFormData = z.infer<typeof createTailscaleServerSchema>

const TailscaleForm = () => {
  const [generatedCommands, setGeneratedCommands] = useState<string[]>([])
  const [showCreateServer, setShowCreateServer] = useState<boolean>(false)

  const form = useForm<TailscaleFormData>({
    resolver: zodResolver(createTailscaleServerSchema),
    defaultValues: {
      name: '',
      description: '',
      hostname: uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '-',
        length: 3,
        style: 'lowerCase',
      }),
      username: 'root',
    },
  })

  const {
    execute: fetchOAuthClientSecret,
    isPending: isFetchingOAuthClientSecret,
  } = useAction(getOAuthClientSecretAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        generateAuthKey({ access_token: data.data.access_token })
      } else {
        toast.error('Failed to fetch Tailscale OAuth client secret')
      }
    },
    onError: ({ error }) => {
      console.error('Error fetching Tailscale OAuth client secret:', error)
      toast.error(
        'Failed to fetch Tailscale OAuth client secret. Please try again.',
      )
    },
  })

  const { execute: generateAuthKey, isPending: isGenerating } = useAction(
    generateOAuthClientSecretAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success && data.data) {
          if (!data.data.key) {
            toast.error('Unable to create Tailscale auth key')
            return
          }

          const hostname = form.getValues('hostname')
          const commands = [
            'sudo curl -fsSL https://tailscale.com/install.sh | sh',
            `sudo tailscale up --authkey=${data.data.key} --hostname=${hostname || 'server'} --ssh --advertise-tags tag:customer-machine`,
          ]

          setGeneratedCommands(commands)
          toast.success('Tailscale auth key generated successfully!')
        } else {
          toast.error('Failed to generate auth key')
        }
      },
      onError: ({ error }) => {
        console.error('Error generating Tailscale auth key:', error)
        toast.error('Failed to generate Tailscale auth key. Please try again.')
      },
    },
  )

  const isGenerated = generatedCommands.length > 0

  const handleGenerate = async () => {
    fetchOAuthClientSecret()
  }

  const copyToClipboard = async (command: string, index: number) => {
    try {
      await navigator.clipboard.writeText(command)
      toast.success(`Command ${index + 1} copied to clipboard`)
    } catch (err) {
      toast.error('Failed to copy command')
    }
  }

  const { execute: testConnection, isExecuting: isTestingConnection } =
    useAction(checkServerConnection, {
      onSuccess: ({ data }) => {
        if (data?.isConnected) {
          setShowCreateServer(true)
          toast.success('Connection test successful!')
        } else {
          toast.error('Connection test failed. Please check your settings.')
        }
      },
      onError: ({ error }) => {
        console.log(error)
      },
    })

  const handleTestConnection = () => {
    const { hostname, username } = form.getValues()

    // Validate required fields
    const errors: string[] = []
    if (!hostname?.trim()) errors.push('Hostname')
    if (!username?.trim()) errors.push('Username')

    if (errors.length > 0) {
      toast.error(`Please fill in required fields: ${errors.join(', ')}`)
      return
    }

    testConnection({
      connectionType: 'tailscale',
      hostname,
      username,
    })
  }

  const { execute: createServer, isPending: isCreatingServer } = useAction(
    createTailscaleServerAction,
    {
      onSuccess: ({ data }) => {
        toast.success('Server created successfully!')
      },
      onError: ({ error }) => {
        console.error('Error creating server:', error)
        toast.error('Failed to create server. Please try again.')
      },
      onSettled: () => {
        form.reset()
        setGeneratedCommands([])
      },
    },
  )

  const handleCreateServer = () => {
    const { name, description, hostname, username } = form.getValues()

    console.log('Creating server with:', {
      name,
      description,
      hostname,
      username,
    })

    createServer({
      name,
      description,
      hostname,
      username,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleGenerate)}
        className='w-full space-y-6'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} className='rounded-sm' />
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
                <Input {...field} className='rounded-sm' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='hostname'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hostname (Auto-generated)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Generating unique hostname...'
                    className='cursor-not-allowed rounded-sm bg-muted'
                    readOnly
                    disabled
                  />
                </FormControl>
                <FormMessage />
                <p className='mt-1 text-xs text-muted-foreground'>
                  A unique hostname has been automatically generated for your
                  server
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Enter username'
                    className='rounded-sm'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='space-y-4'>
          {/* Generate Auth Key Section */}
          <div className='rounded-lg border bg-muted/30 p-4'>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <Key className='h-4 w-4 text-muted-foreground' />
                  <p className='text-sm font-medium text-foreground'>
                    Tailscale Auth Key
                  </p>
                </div>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Generate authentication key for secure mesh networking
                </p>
              </div>
              <Button
                type='submit'
                disabled={
                  isFetchingOAuthClientSecret || isGenerating || isGenerated
                }
                className='shrink-0'>
                {isGenerating ? (
                  <>
                    <RefreshCw className='mr-2 h-3 w-3 animate-spin' />
                    Generating...
                  </>
                ) : isGenerated ? (
                  <>
                    <CheckCircle className='mr-2 h-3 w-3' />
                    Generated
                  </>
                ) : (
                  <>
                    <Key className='mr-2 h-3 w-3' />
                    Generate Key
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Generated Commands Section */}
          {isGenerated && generatedCommands.length > 0 && (
            <div className='rounded-lg border bg-muted/50 p-4'>
              <div className='mb-3 flex items-center gap-2'>
                <Terminal className='h-4 w-4 text-muted-foreground' />
                <p className='text-sm font-medium text-foreground'>
                  Generated Commands
                </p>
              </div>
              <p className='mb-4 text-xs text-muted-foreground'>
                Execute these commands on your server to install and configure
                Tailscale
              </p>

              <div className='space-y-3'>
                {generatedCommands.map((command, index) => (
                  <div key={index} className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <p className='text-xs font-medium text-foreground'>
                        Step {index + 1}:{' '}
                        {index === 0
                          ? 'Install Tailscale'
                          : 'Connect to Network'}
                      </p>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => copyToClipboard(command, index)}
                        className='h-6 px-2'>
                        <Copy className='mr-1 h-3 w-3' />
                        Copy
                      </Button>
                    </div>
                    <div className='relative'>
                      <pre className='overflow-x-auto rounded border bg-background p-3 text-xs text-foreground'>
                        <code>{command}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>

              <div className='mt-4 rounded border bg-muted/30 p-3'>
                <p className='text-xs text-muted-foreground'>
                  💡 <strong>Tip:</strong> Run these commands in order on your
                  server. The first command installs Tailscale, and the second
                  connects it to your network.
                </p>
              </div>
            </div>
          )}

          {/* Test Connection Section */}
          <div className='rounded-lg border bg-muted/30 p-4'>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <Shield className='h-4 w-4 text-muted-foreground' />
                  <p className='text-sm font-medium text-foreground'>
                    Server Connection Test
                  </p>
                </div>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Verify Tailscale network connectivity
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                onClick={handleTestConnection}
                // disabled={!isGenerated || isTestingConnection || isGenerating}
                disabled={isTestingConnection || isGenerating}
                className='shrink-0'>
                {isTestingConnection ? (
                  <>
                    <RefreshCw className='mr-2 h-3 w-3 animate-spin' />
                    Testing...
                  </>
                ) : (
                  <>
                    <Shield className='mr-2 h-3 w-3' />
                    Test Connection
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className='flex w-full items-center justify-end'>
          <Button
            type='button'
            disabled={isCreatingServer || !showCreateServer}
            onClick={handleCreateServer}>
            Create Server
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default TailscaleForm
