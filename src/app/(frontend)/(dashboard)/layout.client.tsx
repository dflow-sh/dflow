'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import Tabs from '@/components/Tabs'
import { isDemoEnvironment } from '@/lib/constants'
import { cn } from '@/lib/utils'

const LayoutClient = ({ children }: { children?: React.ReactNode }) => {
  const pathName = usePathname()

  const tabsList = [
    { label: 'Dashboard', slug: '/dashboard' },
    { label: 'Servers', slug: '/servers' },
    { label: 'Security', slug: '/security' },
    { label: 'Integrations', slug: '/integrations' },
    // { label: 'Templates', slug: '/templates' },
    { label: 'Docs', slug: '/docs/getting-started/introduction' },
  ]

  return (
    <>
      <div
        className={cn(
          'sticky z-40 bg-background',
          isDemoEnvironment ? 'top-[116px]' : 'top-[68px]',
        )}>
        <div
          className='mx-auto w-full max-w-6xl overflow-x-scroll px-4'
          style={{ scrollbarWidth: 'none' }}>
          <Tabs
            tabs={tabsList.map(({ label, slug }) => ({
              label: <Link href={slug}>{label}</Link>,
              asChild: true,
            }))}
            defaultActiveTab={tabsList.findIndex(({ slug }) =>
              pathName.includes(slug),
            )}
          />
        </div>

        <div className='absolute bottom-0 z-[-10] h-[1px] w-full bg-border' />
      </div>

      <main className='mx-auto mb-32 w-full max-w-6xl px-4 pt-4'>
        {children}
      </main>
    </>
  )
}

export default LayoutClient
