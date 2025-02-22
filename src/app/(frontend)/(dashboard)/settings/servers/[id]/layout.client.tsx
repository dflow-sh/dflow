'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'

import Tabs from '@/components/Tabs'

const tabsList = [
  { label: 'General', slug: 'general', disabled: false },
  { label: 'Monitoring', slug: 'monitoring', disabled: true },
] as const

const LayoutClient = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ id: string }>()

  const path = pathname.split('/')?.at(-1) ?? ''

  const activeTab = tabsList.findIndex(({ slug }) => {
    return slug === path
  })

  return (
    <>
      <Tabs
        tabs={tabsList.map(({ label, disabled }) => ({ label, disabled }))}
        onTabChange={index => {
          const tab = tabsList[index]
          router.push(`/settings/servers/${params.id}/${tab.slug}`)
        }}
        defaultActiveTab={activeTab >= 0 ? activeTab : 0}
      />

      <div className='mb-8 max-w-5xl'>{children}</div>
    </>
  )
}

export default LayoutClient
