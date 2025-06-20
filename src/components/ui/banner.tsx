'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Banner } from '@/payload-types'

interface BannerProps {
  banners: Banner[]
}

interface DismissedBanner {
  id: string
  dismissedAt: number
}

const bannerTypeIcon = {
  announcement: '📢',
  maintainance: '🔧',
  promotion: '🎉',
  alert: '⚠️',
}

const variantStyles = {
  info: 'border-info/50 bg-info-foreground/90 text-info dark:border-info [&>svg]:text-info',
  warning:
    'border-warning/50 bg-warning-foreground/90 text-warning [&>svg]:text-warning',
  success:
    'border-success/50 bg-success-foreground/90 text-success [&>svg]:text-success',
}

const ctaButtonStyles = {
  info: 'bg-info/50 hover:bg-info/30 text-white',
  warning: 'bg-warning/50 hover:bg-warning/30 text-white',
  success: 'bg-success/50 hover:bg-success/30 text-white',
}

const closeButtonStyles = {
  info: 'hover:bg-blue-200 text-blue-700',
  warning: 'hover:bg-amber-200 text-amber-700',
  success: 'hover:bg-green-200 text-green-700',
}

const DISMISSAL_DURATION = 24 * 60 * 60 * 1000
const STORAGE_KEY = 'dismissed-banners'

export default function BannerComponent({ banners }: BannerProps) {
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(
    new Set(),
  )
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadDismissedBanners = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const dismissedData: DismissedBanner[] = JSON.parse(stored)
          const now = Date.now()

          const validDismissals = dismissedData.filter(
            item => now - item.dismissedAt < DISMISSAL_DURATION,
          )

          localStorage.setItem(STORAGE_KEY, JSON.stringify(validDismissals))

          const dismissedIds = new Set(validDismissals.map(item => item.id))
          setDismissedBanners(dismissedIds)
        }
      } catch (error) {
        console.error('Error loading dismissed banners:', error)
      }
    }

    loadDismissedBanners()
  }, [])

  const activeBanners = banners.filter(
    banner => !dismissedBanners.has(banner.id),
  )

  const dismissBanner = (bannerId: string) => {
    try {
      setDismissedBanners(prev => new Set([...prev, bannerId]))

      const stored = localStorage.getItem(STORAGE_KEY)
      const existingDismissals: DismissedBanner[] = stored
        ? JSON.parse(stored)
        : []

      const newDismissal: DismissedBanner = {
        id: bannerId,
        dismissedAt: Date.now(),
      }

      const updatedDismissals = [
        ...existingDismissals.filter(item => item.id !== bannerId),
        newDismissal,
      ]

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDismissals))
    } catch (error) {
      console.error('Error dismissing banner:', error)
    }
  }

  const scrollToNext = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const scrollToPrev = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }

  if (activeBanners.length === 0) {
    return null
  }

  return (
    <div className='relative w-full'>
      {activeBanners.length > 1 && (
        <>
          <Button
            variant='ghost'
            size='icon'
            className={`absolute left-2 top-1/2 z-10 size-6 -translate-y-1/2`}
            onClick={scrollToPrev}>
            <ChevronLeft className='h-4 w-4' />
            <span className='sr-only'>Previous banner</span>
          </Button>

          <Button
            variant='ghost'
            size='icon'
            className={`absolute right-2 top-1/2 z-10 size-6 -translate-y-1/2`}
            onClick={scrollToNext}>
            <ChevronRight className='h-4 w-4' />
            <span className='sr-only'>Next banner</span>
          </Button>
        </>
      )}

      <div
        ref={scrollContainerRef}
        className='scrollbar-hide flex snap-x snap-mandatory overflow-x-auto'
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {activeBanners.map(banner => (
          <div
            key={banner.id}
            className={cn(
              'relative flex w-full flex-shrink-0 snap-start items-center justify-center px-6 py-1 transition-colors duration-200',
              variantStyles[banner.variant ?? 'info'],
            )}>
            <div className='mx-auto flex max-w-7xl items-center justify-center gap-3'>
              <div className='flex-shrink-0'>
                {bannerTypeIcon[banner.type] && (
                  <span className='text-lg'>{bannerTypeIcon[banner.type]}</span>
                )}
              </div>

              <div className='flex items-center gap-4'>
                <div className='text-center'>
                  {banner.title && (
                    <span className='mr-2 text-sm font-medium'>
                      {banner.title}
                    </span>
                  )}

                  <span className='text-sm'>{banner.content}</span>
                </div>

                {banner.cta?.label && banner.cta?.url && (
                  <Button
                    variant={'outline'}
                    size='sm'
                    className={`h-6 rounded-sm border-none px-3 text-slate-200 ${ctaButtonStyles[banner.variant ?? 'info']}`}
                    onClick={() => {
                      if (banner.cta?.isExternal) {
                        window.open(
                          banner.cta?.url ?? undefined,
                          '_blank',
                          'noopener,noreferrer',
                        )
                      } else {
                        window.location.href = banner?.cta?.url!
                      }
                    }}>
                    {banner.cta.label}
                  </Button>
                )}
              </div>

              {banner.isDismissible && (
                <Button variant='ghost' size='icon' className='size-6'>
                  <X
                    className='h-3.5 w-3.5 cursor-pointer stroke-white'
                    onClick={() => dismissBanner(banner.id)}
                  />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}