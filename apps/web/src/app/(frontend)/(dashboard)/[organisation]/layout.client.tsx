'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import React from 'react'

import Tabs from '@dflow/components/Tabs'
import { cn } from '@dflow/shared'

const LayoutClient = ({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) => {
  const pathName = usePathname()
  const params = useParams<{ organisation: string }>()

  const tabsList = [
    { label: 'Dashboard', slug: '/dashboard' },
    { label: 'Servers', slug: `/servers` },
    { label: 'Security', slug: `/security` },
    { label: 'Integrations', slug: `/integrations` },
    { label: 'Backups', slug: `/backups` },
    { label: 'Templates', slug: `/templates` },
    { label: 'Team', slug: `/team` },
    { label: 'Docs', slug: '/docs/getting-started/introduction' },
  ]

  return (
    <>
      <div className={cn('bg-background sticky top-[68px] z-40')}>
        <div
          className='mx-auto w-full max-w-6xl overflow-x-scroll px-4'
          style={{ scrollbarWidth: 'none' }}>
          <Tabs
            tabs={tabsList.map(({ label, slug }) => ({
              label: (
                <Link href={`/${params.organisation}${slug}`}>{label}</Link>
              ),
              asChild: true,
            }))}
            defaultActiveTab={tabsList.findIndex(({ slug }) => {
              const url = pathName.split(`/${params.organisation}`).at(-1)
              const splittedSlug = `/${slug.split('/').at(1)}`

              return url?.startsWith(splittedSlug)
            })}
          />
        </div>

        <div className='bg-border absolute bottom-0 z-[-10] h-px w-full' />
      </div>

      <main
        className={cn('mx-auto w-full max-w-6xl px-4 pt-4 pb-32', className)}>
        {children}
      </main>
    </>
  )
}

export default LayoutClient
