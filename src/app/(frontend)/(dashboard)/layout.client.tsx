'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import Tabs from '@/components/Tabs'

const LayoutClient = ({ children }: { children?: React.ReactNode }) => {
  const pathName = usePathname()
  const tabsList = [
    { label: 'Dashboard', slug: '/dashboard' },
    { label: 'Servers', slug: '/settings/servers' },
    { label: 'SSH Keys', slug: '/settings/ssh-keys' },
    { label: 'Integrations', slug: '/integrations' },
  ]

  return (
    <>
      <div className='relative'>
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
        <div className='absolute bottom-[18.5px] z-[-10] h-[1px] w-full bg-border' />
      </div>

      <main className='mx-auto mb-10 mt-4 w-full max-w-6xl px-4'>
        {children}
      </main>
    </>
  )
}

export default LayoutClient
