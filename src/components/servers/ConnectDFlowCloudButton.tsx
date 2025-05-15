'use client'

import { CloudCog } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import React from 'react'
import { toast } from 'sonner'

import { generateDFlowAccessTokenAction } from '@/actions/cloud/dFlow'
import { Button } from '@/components/ui/button'

export const ConnectDFlowCloudButton: React.FC = () => {
  const { execute, isPending } = useAction(generateDFlowAccessTokenAction, {
    onSuccess: result => {
      if (result.data) {
        toast.success('Successfully connected to dFlow Cloud', {
          description: 'Your dFlow Cloud account is now linked',
        })
      }
    },
    onError: error => {
      toast.error('Error connecting to dFlow Cloud', {
        description: error.error.serverError || 'An unexpected error occurred',
      })
    },
  })

  const handleConnect = () => {
    execute()
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isPending}
      className='w-full max-w-md'>
      <CloudCog className='mr-2 h-4 w-4' />
      {isPending ? 'Connecting...' : 'Connect to dFlow Cloud'}
    </Button>
  )
}
