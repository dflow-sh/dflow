'use client'

import React from 'react'

import { cn } from '@dflow/core/lib/utils'

const XTermTerminal = ({
  ref,
  className = '',
}: {
  ref: React.RefObject<HTMLDivElement | null>
  className?: string
}) => {
  return (
    <div className={cn('h-[70vh] rounded-sm bg-border py-4 pl-4', className)}>
      <div ref={ref} className='h-full w-full' />
    </div>
  )
}

export default XTermTerminal
