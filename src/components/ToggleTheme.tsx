'use client'

import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { Toggle } from '@/components/ui/toggle'

export default function ToggleTheme() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <Toggle
      variant='outline'
      className={
        'group hidden size-9 data-[state=on]:bg-transparent data-[state=on]:hover:bg-muted md:inline-flex'
      }
      pressed={theme === 'dark'}
      onPressedChange={() =>
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
      }
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      <MoonIcon
        size={16}
        className='shrink-0 scale-0 text-foreground opacity-0 transition-all data-[state=on]:scale-100 data-[state=on]:opacity-100 dark:scale-100 dark:opacity-100'
        aria-hidden='true'
      />
      <SunIcon
        size={16}
        className='absolute shrink-0 scale-100 text-foreground opacity-100 transition-all data-[state=on]:scale-0 data-[state=on]:opacity-0 dark:scale-0 dark:opacity-0'
        aria-hidden='true'
      />
    </Toggle>
  )
}
