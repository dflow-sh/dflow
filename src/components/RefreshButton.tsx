'use client'

import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

import { Button } from '@/components/ui/button'

interface RefreshButtonProps {
  showText?: boolean
  text?: string
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export default function RefreshButton({
  showText = false,
  text = 'Refresh',
  variant = 'outline',
  size = 'icon',
}: RefreshButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  // If showing text, use default size instead of icon size
  const buttonSize = showText ? 'default' : size

  return (
    <Button
      variant={variant}
      size={buttonSize}
      title='Refresh server status'
      isLoading={isPending}
      disabled={isPending}
      onClick={handleRefresh}>
      <RefreshCw className='h-4 w-4' />
      {showText && <span className='ml-2'>{text}</span>}
    </Button>
  )
}
