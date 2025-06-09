'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useTransition } from 'react'
import { toast } from 'sonner'

const RefreshProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPending, startTransition] = useTransition()
  const { organisation } = useParams<{ organisation: '' }>()
  const router = useRouter()

  // Initializing a SSE for listening changes to update UI
  useEffect(() => {
    const eventSource = new EventSource(
      `/api/refresh?organisation=${organisation}`,
    )
    eventSource.onmessage = event => {
      const data = JSON.parse(event.data) ?? {}
      if (data?.refresh) {
        // Starting react transition hook
        startTransition(() => {
          router.refresh()
        })
      }

      // redirecting user to respective page on page-event
      if (data?.path) {
        router.push(data?.path)
      }
    }

    // On component unmount close the event source
    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [])

  // If reload is triggered showing a toast
  useEffect(() => {
    let toastTimeout: NodeJS.Timeout | null = null

    if (isPending) {
      toast.loading('Syncing with latest changes...', {
        id: 'refresh-toast',
      })
    } else {
      toastTimeout = setTimeout(() => {
        toast.dismiss('refresh-toast')
      }, 3000)
    }

    return () => {
      if (toastTimeout) {
        clearTimeout(toastTimeout)
      }
    }
  }, [isPending])

  return <>{children}</>
}

export default RefreshProvider
