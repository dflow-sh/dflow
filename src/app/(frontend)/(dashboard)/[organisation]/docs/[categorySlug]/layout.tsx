import LayoutClient from '../../layout.client'
import React from 'react'

import DocsSidebar from './DocsSidebar'

interface PageProps {
  params: Promise<{
    organisation: string
  }>
  children: React.ReactNode
}

export default function Layout({ children, params }: PageProps) {
  return (
    <LayoutClient>
      <section className='flex h-full w-full'>
        <DocsSidebar params={params} />

        {/* Right Side Content */}
        <div className='h-full w-full md:flex-1 md:p-6'>{children}</div>
      </section>
    </LayoutClient>
  )
}
