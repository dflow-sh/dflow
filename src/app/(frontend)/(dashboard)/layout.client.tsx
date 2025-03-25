'use client'

import { useProgress } from '@bprogress/next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useTransition } from 'react'

import Tabs from '@/components/Tabs'

const LayoutClient = ({ children }: { children?: React.ReactNode }) => {
  const [isPending, startTransition] = useTransition()
  const { start, stop } = useProgress()

  useEffect(() => {
    if (isPending) {
      start()
    } else {
      stop()
    }
  }, [isPending])

  const pathName = usePathname()

  const tabsList = useMemo(() => {
    return [
      { label: 'Dashboard', slug: '/dashboard' },
      { label: 'Servers', slug: '/settings/servers' },
      { label: 'SSH Keys', slug: '/settings/ssh-keys' },
      { label: 'Git', slug: '/settings/git' },
    ] as const
  }, [])

  return (
    <>
      <div className='relative'>
        <div className='mx-auto w-full max-w-6xl px-4'>
          <Tabs
            tabs={tabsList.map(({ label, slug }) => ({
              label: <Link href={slug}>{label}</Link>,
            }))}
            defaultActiveTab={tabsList.findIndex(({ slug }) =>
              pathName.includes(slug),
            )}
          />
        </div>
        <div className='absolute bottom-[18.5px] z-[-10] h-[1px] w-full bg-border' />
      </div>

      {/* {children} */}
      <main className='mx-auto mb-10 mt-4 w-full max-w-6xl px-4'>
        {children}
      </main>
    </>
  )
}

export default LayoutClient
