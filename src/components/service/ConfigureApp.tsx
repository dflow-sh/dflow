'use client'

import Tabs, { TabContentProps } from '../Tabs'
import Terminal from '../Terminal'

import { Service } from '@/payload-types'

import { GithubForm } from './GithubForm'

const ConfigureApp = ({ service }: { service: Service }) => {
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
                <GithubForm {...props} />
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
