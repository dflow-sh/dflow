'use client'

import { Button, toast } from '@payloadcms/ui'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'

import { checkHostnameConnection } from '@/actions/server'

const ServerHostConnectionCheck = () => {
  const params = useParams<{ segments: string[] }>()
  const { execute, isPending } = useAction(checkHostnameConnection, {
    onSuccess: ({ data }) => {
      toast.success(JSON.stringify(data ?? {}))
    },
    onError: ({ error }) => {
      toast.error(error.serverError)
    },
  })

  return (
    <Button
      disabled={isPending}
      onClick={() => {
        execute({ serverId: params?.segments?.at(-1) ?? '' })
      }}>
      {isPending ? 'Testing...' : 'Test hostname connection'}
    </Button>
  )
}

export default ServerHostConnectionCheck
