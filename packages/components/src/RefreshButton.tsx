'use client'

import { RefreshCw } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useTransition } from 'react'

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
  onRefresh?: () => void | Promise<void>
}

export default function RefreshButton({
  showText = false,
  text = 'Refresh',
  variant = 'outline',
  size = 'icon',
  onRefresh,
}: RefreshButtonProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleRefresh = () => {
    startTransition(() => {
      if (onRefresh) {
        Promise.resolve(onRefresh())
      } else {
        const params = new URLSearchParams(searchParams.toString())
        params.set('refreshServerDetails', 'true')
        router.push(`?${params.toString()}`)
        // router.refresh()
      }
    })
  }

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (params.has('refreshServerDetails')) {
      params.delete('refreshServerDetails')
      router.replace(`?${params.toString()}`)
    }
  }, [searchParams, router])

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
