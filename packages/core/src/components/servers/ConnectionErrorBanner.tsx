'use client'

import { keys as env } from '@core/keys';
import { Mail, MessageSquare, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from "@core/components/ui/alert"
import { Badge } from "@core/components/ui/badge"
import { Button } from "@core/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@core/components/ui/dialog"

const ConnectionErrorBanner = ({
  serverName,
  title = 'Connection Issue Detected',
  subtitle,
  tasks = [
    'Network connectivity issues',
    'Server configuration problems',
    'SSH key or authentication issues',
    'Temporary infrastructure problems',
  ],
  footer,
  ...props
}: {
  serverName?: string
  title?: string
  subtitle?: string
  tasks?: string[]
  footer?: React.ReactNode
  [key: string]: any
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleEmailContact = () => {
    window.open(
      `mailto:${env.RESEND_SENDER_EMAIL}?subject=Server Connection Issue`,
      '_blank',
    )
    setIsOpen(false)
  }

  const handleDiscordContact = () => {
    window.open(env.NEXT_PUBLIC_DISCORD_INVITE_URL, '_blank')
    setIsOpen(false)
  }

  return (
    <Alert
      variant={'destructive'}
      className='relative overflow-hidden border-0 shadow-lg'>
      <div className='mb-3 flex items-center gap-4'>
        <span className='bg-destructive/20 rounded-full p-3'>
          <TriangleAlert className='text-destructive h-5 w-5' />
        </span>
        <div>
          <AlertTitle className='text-lg font-bold'>{title}</AlertTitle>
          <div className='text-muted-foreground text-sm'>
            {subtitle ||
              `${serverName ? `"${serverName}"` : 'Your server'} could not be connected after multiple attempts.`}
          </div>
        </div>
        <Badge variant='destructive' className='ml-auto'>
          Action Required
        </Badge>
      </div>
      <AlertDescription>
        <div className='mb-3 space-y-2 text-sm'>
          <p>
            We were unable to establish a connection to your server after 30
            attempts. This could be due to:
          </p>
          <ul className='list-disc space-y-1 pl-6 text-xs'>
            {tasks.map((task, i) => (
              <li key={i}>{task}</li>
            ))}
          </ul>
        </div>
        <div className='text-muted-foreground border-t pt-2 text-xs'>
          {footer || (
            <span>
              Please{' '}
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant='link'
                    className='text-primary hover:text-primary/80 h-auto p-0 underline'>
                    contact our support team
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-md'>
                  <DialogHeader>
                    <DialogTitle className='text-xl font-semibold'>
                      Contact Support
                    </DialogTitle>
                  </DialogHeader>

                  <div className='space-y-4'>
                    <p className='text-muted-foreground text-sm'>
                      Get help with your server connection issue through one of
                      these channels:
                    </p>

                    <div className='space-y-3'>
                      <Button
                        onClick={handleEmailContact}
                        className='w-full justify-start gap-3'
                        variant='outline'>
                        <Mail className='h-4 w-4' />
                        Email Support
                      </Button>

                      {env.NEXT_PUBLIC_DISCORD_INVITE_URL && (
                        <Button
                          onClick={handleDiscordContact}
                          className='w-full justify-start gap-3'
                          variant='outline'>
                          <MessageSquare className='h-4 w-4' />
                          Join Discord
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>{' '}
              for assistance. We'll help you diagnose and resolve the issue.
            </span>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

export default ConnectionErrorBanner
