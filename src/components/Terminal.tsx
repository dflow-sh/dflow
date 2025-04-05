'use client'

import { Loader } from 'lucide-react'

// import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

type TerminalType = {
  messages?: string[]
  className?: string
  isLoading?: boolean
}

const Terminal = ({
  messages = [],
  className = '',
  isLoading = true,
}: TerminalType) => {
  // const terminalRef = useRef<HTMLPreElement>(null)
  // const [isAtBottom, setIsAtBottom] = useState(true)

  // Detect user scrolling
  // useEffect(() => {
  //   const container = terminalRef.current
  //   if (!container) return

  //   const handleScroll = () => {
  //     const isUserAtBottom =
  //       container.scrollHeight - container.scrollTop <=
  //       container.clientHeight + 10 // Small buffer
  //     setIsAtBottom(isUserAtBottom)
  //   }

  //   container.addEventListener('scroll', handleScroll)
  //   return () => container.removeEventListener('scroll', handleScroll)
  // }, [])

  // Auto-scroll only when user is at the bottom
  // useEffect(() => {
  //   const container = terminalRef.current
  //   if (container && isAtBottom) {
  //     container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  //   }
  // }, [messages, isAtBottom])

  return (
    <pre
      className={cn(
        'flex h-96 w-full flex-col gap-1 overflow-y-scroll text-wrap rounded bg-border p-4 font-mono text-sm text-foreground',
        className,
      )}>
      {messages.length
        ? messages.map((message, index) => <p key={index}>{message}</p>)
        : null}

      <span className='flex items-center gap-0.5'>
        {isLoading && <Loader className='animate-spin' />}
      </span>
    </pre>
  )
}

export default Terminal
