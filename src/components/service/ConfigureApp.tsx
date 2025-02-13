'use client'

import Tabs, { TabContentProps } from '../Tabs'
import Terminal from '../Terminal'

import { GitProvider, Service } from '@/payload-types'

import GeneralTab from './GeneralTab'

const ConfigureApp = ({
  service,
  gitProviders,
}: {
  service: Service
  gitProviders: GitProvider[]
}) => {
  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-2xl font-semibold'>{service.name}</h1>
        <p className='text-muted-foreground'>{service.description}</p>
      </div>

      <Tabs
        tabs={[
          {
            label: 'General',
            content: (props: TabContentProps) => (
              <div className='max-w-2xl'>
                <GeneralTab gitProviders={gitProviders} service={service} />
              </div>
            ),
          },
          { label: 'Environment', content: () => <></> },
          { label: 'Monitoring', content: () => <></> },
          { label: 'Logs', content: () => <Terminal /> },
          { label: 'Deployments', content: () => <></> },
          { label: 'Domains', content: () => <></> },
        ]}
      />
    </div>
  )
}

export default ConfigureApp
