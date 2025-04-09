'use client'

import { Eye } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'

interface SecretContentProps {
  children: ReactNode
  autoHideDelay?: number
  placeholder: string
  className?: string
}

const SecretContent = ({
  children,
  autoHideDelay = 8000, // Default 8 seconds
  placeholder,
  className = '',
}: SecretContentProps) => {
  const [isVisible, setIsVisible] = useState(false)

  // Auto-hide after specified delay
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isVisible && autoHideDelay > 0) {
      timer = setTimeout(() => {
        setIsVisible(false)
      }, autoHideDelay)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isVisible, autoHideDelay])

  return (
    <div className={`relative ${className}`}>
      {children}
      {!isVisible && (
        <div
          className='absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center rounded-md border bg-muted/20 backdrop-blur-md transition-all duration-300 hover:bg-muted/30'
          onClick={() => setIsVisible(true)}>
          <div className='flex items-center gap-2 text-sm'>
            <Eye className='h-4 w-4' />
            <span>{placeholder}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SecretContent
