'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Banner } from '@/payload-types'

interface BannerProps {
  banners: Banner[]
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
  info: 'bg-none hover:text-info text-white',
  warning: 'bg-transparent hover:text-amber-700 text-white',
  success: 'bg-transparent hover:text-green-700 text-white',
}

const closeButtonStyles = {
  info: 'hover:bg-blue-200 text-blue-700',
  warning: 'hover:bg-amber-200 text-amber-700',
  success: 'hover:bg-green-200 text-green-700',
}

export default function BannerComponent({ banners }: BannerProps) {
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(
    new Set(),
  )
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const activeBanners = banners.filter(
    banner => !dismissedBanners.has(banner.id),
  )

  const dismissBanner = (bannerId: string) => {
    setDismissedBanners(prev => new Set([...prev, bannerId]))
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
            size='sm'
            className={`absolute left-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-lg border-0 bg-transparent p-0 text-slate-200`}
            onClick={scrollToPrev}>
            <ChevronLeft className='h-4 w-4' />
            <span className='sr-only'>Previous banner</span>
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className={`absolute right-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-lg border-0 bg-transparent p-0 text-slate-200`}
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
                    variant={'link'}
                    size='sm'
                    className={`p-0 text-slate-200 ${ctaButtonStyles[banner.variant ?? 'info']}`}
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
                <Button
                  variant='link'
                  size='sm'
                  className={cn(
                    'ml-2 h-7 w-7 flex-shrink-0 rounded-md p-0 transition-colors duration-200',
                    closeButtonStyles[banner.variant ?? 'info'],
                  )}
                  onClick={() => dismissBanner(banner.id)}>
                  <X className='h-3.5 w-3.5' />
                  <span className='sr-only'>Dismiss banner</span>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
