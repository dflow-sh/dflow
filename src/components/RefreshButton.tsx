'use client'

import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

import { Button } from '@/components/ui/button'

export default function RefreshButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <Button
      variant='outline'
      size='icon'
      title='Refresh server status'
      isLoading={isPending}
      disabled={isPending}
      onClick={handleRefresh}>
      <RefreshCw className='h-4 w-4' />
    </Button>
  )
}
