'use client'

import { parseAsStringEnum, useQueryState } from 'nuqs'

import PageHeader from '@/components/PageHeader'
import Tabs from '@/components/Tabs'

const tabsList = [
  { label: 'General', slug: 'general', disabled: false },
  { label: 'Plugins', slug: 'plugins', disabled: false },
  { label: 'Domains', slug: 'domains', disabled: false },
  { label: 'Monitoring', slug: 'monitoring', disabled: false },
] as const

const LayoutClient = ({ children }: { children: React.ReactNode }) => {
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringEnum([
      'general',
      'monitoring',
      'plugins',
      'domains',
    ]).withDefault('general'),
  )

  const activeTab = tabsList.findIndex(({ slug }) => {
    return slug === tab
  })

  return (
    <>
      <PageHeader title='Servers' />

      <Tabs
        tabs={tabsList.map(({ label, disabled }) => ({ label, disabled }))}
        onTabChange={index => {
          const tab = tabsList[index]
          setTab(tab.slug, {
            shallow: false,
          })
        }}
        defaultActiveTab={activeTab >= 0 ? activeTab : 0}
      />

      <div className='mb-8 max-w-5xl'>{children}</div>
    </>
  )
}

export default LayoutClient
