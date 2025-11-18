'use client'

import type { Variants } from 'motion/react'
import { motion } from 'motion/react'

import { cn } from '@dflow/lib/utils'

const pathVariants: Variants = {
  initial: {
    opacity: 1,
    pathLength: 1,
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
  },
}

const AnimatedCrossIcon = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'bg-destructive/20 text-destructive grid size-24 place-items-center rounded-full',
        className,
      )}>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width={60}
        height={60}
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'>
        <motion.path
          variants={pathVariants}
          initial='initial'
          animate='animate'
          d='M18 6 6 18'
        />
        <motion.path
          transition={{ delay: 0.2 }}
          variants={pathVariants}
          initial='initial'
          animate='animate'
          d='m6 6 12 12'
        />
      </svg>
    </div>
  )
}

export default AnimatedCrossIcon
