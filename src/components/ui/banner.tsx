'use client'

import { ExternalLink, X } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Banner } from '@/payload-types'

interface BannerProps {
  banners: Banner[]
}

const variantStyles = {
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  neutral: 'bg-gray-50 border-gray-200 text-gray-900',
  primary: 'bg-purple-50 border-purple-200 text-purple-900',
  secondary: 'bg-slate-50 border-slate-200 text-slate-900',
}

const ctaButtonStyles = {
  info: 'bg-blue-600 hover:bg-blue-700 text-white',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  error: 'bg-red-600 hover:bg-red-700 text-white',
  neutral: 'bg-gray-600 hover:bg-gray-700 text-white',
  primary: 'bg-purple-600 hover:bg-purple-700 text-white',
  secondary: 'bg-slate-600 hover:bg-slate-700 text-white',
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

  if (activeBanners.length === 0) {
    return null
  }

  return (
    <div className='relative w-full'>
      <div
        ref={scrollContainerRef}
        className='scrollbar-hide flex overflow-x-auto'
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {activeBanners.map(banner => (
          <div
            key={banner.id}
            className={cn(
              'relative flex w-full flex-shrink-0 items-center justify-between px-4 py-1',
              variantStyles[banner.variant ?? 'info'],
            )}>
            <div className='mx-auto flex w-full max-w-6xl items-center justify-between px-4'>
              <div className='flex-1'>
                {banner.title && (
                  <h3 className='mb-1 font-semibold'>{banner.title}</h3>
                )}
                <p className='text-sm'>{banner.content}</p>
              </div>

              <div className='flex items-center gap-2'>
                {banner.cta?.label && banner.cta?.url && (
                  <Button
                    size='sm'
                    className={cn(
                      'text-xs',
                      ctaButtonStyles[banner.variant ?? 'info'],
                    )}
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
                    {banner.cta.isExternal && (
                      <ExternalLink className='ml-1 h-3 w-3' />
                    )}
                  </Button>
                )}

                {banner.isDismissible && (
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 flex-shrink-0 hover:bg-black/10'
                    onClick={() => dismissBanner(banner.id)}>
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
