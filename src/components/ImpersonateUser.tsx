'use client'

import { Button, toast } from '@payloadcms/ui'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'

import { impersonateUserAction } from '@/actions/auth'

const ImpersonateUser = () => {
  const params = useParams<{ segments: string[] }>()

  const { execute, isPending } = useAction(impersonateUserAction, {
    onError: ({ error, input }) => {
      toast.error(`Failed to impersonate: ${input.userId}`, {
        description: error.serverError,
      })
    },
  })

  return (
    <Button
      disabled={isPending}
      onClick={() => {
        execute({ userId: params.segments.at(-1) ?? '' })
      }}>
      {isPending ? 'Impersonating...' : 'Impersonate User'}
    </Button>
  )
}

export default ImpersonateUser
