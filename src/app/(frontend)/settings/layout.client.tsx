'use client'

import { usePathname, useRouter } from 'next/navigation'

import { DynamicBreadcrumbs } from '@/components/DynamicBreadcrumbs'
import Tabs from '@/components/Tabs'

const tabsList = [
  { label: 'Profile', slug: 'profile' },
  { label: 'Appearance', slug: 'appearance' },
  { label: 'SSH Keys', slug: 'ssh-keys' },
  { label: 'Servers', slug: 'servers' },
  { label: 'Team', slug: 'team' },
] as const

const LayoutClient = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname()
  const path = pathname.split('/')?.at(-1) ?? ''

  const activeTab = tabsList.findIndex(({ slug }) => {
    return slug === path
  })

  console.log({ activeTab, path })

  return (
    <>
      <DynamicBreadcrumbs items={[]} />
      <h1 className='mb-4 text-xl font-semibold'>Settings</h1>

      <Tabs
        tabs={tabsList.map(({ label }) => ({ label }))}
        onTabChange={index => {
          const tab = tabsList[index]
          router.push(`/settings/${tab.slug}`)
        }}
        defaultActiveTab={activeTab >= 0 ? activeTab : 0}
      />
      {children}
    </>
  )
}

export default LayoutClient
