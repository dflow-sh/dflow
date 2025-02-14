'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'

import Tabs from '@/components/Tabs'

const tabsList = [
  { label: 'General', slug: 'general' },
  { label: 'Environment', slug: 'environment' },
  { label: 'Monitoring', slug: 'monitoring' },
  { label: 'Servers', slug: 'servers' },
  { label: 'Logs', slug: 'logs' },
  { label: 'Deployments', slug: 'deployments' },
  { label: 'Domains', slug: 'domains' },
] as const

const LayoutClient = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ id: string; serviceId: string }>()

  const path = pathname.split('/')?.at(-1) ?? ''

  const activeTab = tabsList.findIndex(({ slug }) => {
    return slug === path
  })

  return (
    <>
      <Tabs
        tabs={tabsList.map(({ label }) => ({ label }))}
        onTabChange={index => {
          const tab = tabsList[index]
          router.push(
            `/dashboard/project/${params.id}/service/${params.serviceId}/${tab.slug}`,
          )
        }}
        defaultActiveTab={activeTab >= 0 ? activeTab : 0}
      />

      <div className='mb-8 max-w-5xl'>{children}</div>
    </>
  )
}

export default LayoutClient
