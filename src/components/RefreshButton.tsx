'use client'

import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

export default function RefreshButton() {
  const router = useRouter()

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <Button
      variant='outline'
      size='icon'
      title='Refresh server status'
      onClick={handleRefresh}>
      <RefreshCw className='h-4 w-4' />
    </Button>
  )
}
