'use client'

import { Eye } from 'lucide-react'
import { type ReactNode, useState } from 'react'

interface SecretContentProps {
  children: ReactNode
  className?: string
  placeholder?: string
  defaultHide?: boolean
}

const SecretContent = ({
  children,
  className = '',
  placeholder = 'reveal / edit',
  defaultHide = true,
}: SecretContentProps) => {
  const [hide, setHide] = useState(defaultHide)

  return (
    <div className={`relative ${className}`}>
      {children}

      {hide && (
        <div
          className='absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center rounded-md border bg-muted/20 backdrop-blur-md transition-all duration-300 hover:bg-muted/30'
          onClick={() => setHide(false)}>
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
