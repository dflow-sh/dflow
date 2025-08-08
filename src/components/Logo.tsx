'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import { Branding } from '@/payload-types'
import { useBrandingContext } from '@/providers/BrandingProvider'

import { Skeleton } from './ui/skeleton'

const extractLogoUrl = (logo: NonNullable<Branding['logo']>['lightMode']) => {
  if (typeof logo === 'object' && logo?.url) {
    return { url: logo.url, alt: logo.alt || 'Logo' }
  }
}

const Logo = ({
  className = '',
  skeletonClassName = '',
  showText = false,
}: {
  className?: string
  skeletonClassName?: string
  showText?: boolean
}) => {
  const [mounted, setMounted] = useState(false)

  const { branding } = useBrandingContext()
  const { theme } = useTheme()

  const lightMode = branding?.logo?.lightMode
  const darkMode = branding?.logo?.darkMode

  const logoUrl =
    theme === 'dark' ? extractLogoUrl(darkMode) : extractLogoUrl(lightMode)

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (logoUrl?.url && !mounted) {
    return <Skeleton className={cn('h-8 w-24', skeletonClassName)} />
  }

  return (
    <>
      <Image
        src={logoUrl?.url || '/images/dflow-no-bg.png'}
        alt={'logo'}
        width={200}
        height={32}
        key={theme}
        className={cn(
          `h-full max-h-8 w-full max-w-24 object-contain`,
          className,
        )}
      />

      {showText && !logoUrl?.url && <p className='hidden sm:block'>dFlow</p>}
    </>
  )
}

export default Logo
