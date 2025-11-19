import { type Variants, motion } from 'motion/react'

import { cn } from '@/lib/utils'

const pathVariants: Variants = {
  initial: {
    opacity: 1,
    pathLength: 1,
    scale: 1,
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    scale: [0.5, 1],
  },
}

const AnimatedCheckIcon = ({ className }: { className?: string }) => {
  return (
    <div
      role='status'
      className={cn(
        `bg-success-foreground text-success grid size-24 place-items-center rounded-full`,
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
          transition={{
            duration: 0.4,
            opacity: { duration: 0.1 },
            delay: 0.2,
          }}
          initial='initial'
          animate='animate'
          d='M4 12 9 17L20 6'
        />
      </svg>
    </div>
  )
}

export default AnimatedCheckIcon
