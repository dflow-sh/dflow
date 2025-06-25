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
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createTailscaleServerSchema } from '@/actions/server/validator'
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
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [generatedCommands, setGeneratedCommands] = useState<string[]>([])

  const form = useForm<TailscaleFormData>({
    resolver: zodResolver(createTailscaleServerSchema),
    defaultValues: {
      name: '',
      description: '',
      hostname: '',
      username: 'root',
    },
  })

  const handleGenerate = async (values: TailscaleFormData) => {
    setIsGenerating(true)
    console.log('Tailscale form submitted:', values)

    // Simulate API call
    setTimeout(() => {
      // Mock generated commands - replace with actual API response
      const commands = [
        'curl -fsSL https://tailscale.com/install.sh | sh',
        `sudo tailscale up --authkey=tskey-auth-${Math.random().toString(36).substring(2, 15)} --hostname=${values.hostname || 'server'}`,
      ]

      setGeneratedCommands(commands)
      setIsGenerating(false)
      setIsGenerated(true)
    }, 2000)
  }

  const copyToClipboard = async (command: string, index: number) => {
    try {
      await navigator.clipboard.writeText(command)
      toast.success(`Command ${index + 1} copied to clipboard`)
    } catch (err) {
      toast.error('Failed to copy command')
    }
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    console.log('Testing Tailscale connectivity...')

    // Simulate API call
    setTimeout(() => {
      setIsTestingConnection(false)
    }, 3000)
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
                <FormLabel>Hostname</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Enter hostname'
                    className='rounded-sm'
                  />
                </FormControl>
                <FormMessage />
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
                disabled={isGenerating || isGenerated}
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
                disabled={!isGenerated || isTestingConnection || isGenerating}
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
      </form>
    </Form>
  )
}

export default TailscaleForm
