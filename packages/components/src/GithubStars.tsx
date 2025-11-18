'use client'

import { Star } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'

import { Github } from '@dflow/components/icons'
import { Button } from '@dflow/components/ui/button'

import CountUp from './ContUp'

const GithubStars = ({
  githubStars,
}: {
  githubStars: number | undefined | null
}) => {
  return (
    <Link
      href='https://github.com/dflow-sh/dflow'
      target='_blank'
      rel='noopener noreferrer'
      className='hidden sm:block'>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}>
        <Button
          variant='outline'
          size='sm'
          className='group border-primary/20 from-primary/10 via-primary/5 to-primary/10 shadow-primary/20 hover:shadow-primary/30 hover:border-primary/30 relative overflow-hidden bg-gradient-to-r shadow-lg transition-all duration-300 hover:shadow-xl'>
          {/* Animated gradient background */}
          <motion.div
            className='via-primary/20 absolute inset-0 bg-gradient-to-r from-transparent to-transparent'
            animate={{
              x: ['-200%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Shimmer effect on hover */}
          <div className='absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full' />

          <div className='relative z-10 flex items-center gap-2.5'>
            {/* GitHub Icon */}
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}>
              <Github
                width='16'
                height='16'
                className='transition-all duration-300'
              />
            </motion.div>
            {/* Vertical Divider Line */}
            <div className='via-primary/40 h-5 w-px bg-gradient-to-b from-transparent to-transparent' />
            {/* Star Count */}
            {githubStars ? (
              <div className='flex items-center gap-1.5'>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}>
                  <Star className='h-3.5 w-3.5 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]' />
                </motion.div>
                <span className='from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-sm font-bold tabular-nums'>
                  <CountUp
                    from={0}
                    to={githubStars ?? 0}
                    separator=','
                    direction='up'
                    duration={1}
                    className='count-up-text'
                  />
                </span>
              </div>
            ) : (
              <span className='text-sm font-semibold'>Star us</span>
            )}
          </div>

          {/* Glow effect */}
          <div className='absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
            <div className='bg-primary/5 absolute inset-0 blur-xl' />
          </div>
        </Button>
      </motion.div>
    </Link>
  )
}

export default GithubStars
