'use client'

import { useEffect, useRef } from 'react'

import '@/app/(frontend)/styles/coinStyle.css'
import { cn } from '@/lib/utils'

const AnimatedCoinIcon = ({ className }: { className?: string }) => {
  const coinRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const coinElement = coinRef.current
    if (!coinElement) return

    let frameNumber = 1
    const frameSwitch = setInterval(() => {
      if (frameNumber > 8) {
        frameNumber = 1
      } else {
        coinElement.className = 'coinBoxFrame' + frameNumber
        frameNumber++
      }
    }, 100)

    // ✅ Cleanup: clear the interval when the component unmounts
    return () => {
      clearInterval(frameSwitch)
    }
  }, [])

  return (
    <div className={cn(`scale-[0.3]`, className)}>
      <div ref={coinRef} />
    </div>
  )
}

export default AnimatedCoinIcon
