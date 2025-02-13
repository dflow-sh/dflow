'use client'

import { GitProvider, Service } from '@/payload-types'

import BuildTypeForm from './BuildTypeForm'
import DeploymentForm from './DeploymentForm'
import ProviderForm from './ProviderForm'

const GeneralTab = ({
  service,
  gitProviders,
}: {
  service: Service
  gitProviders: GitProvider[]
}) => {
  return (
    <div className='space-y-4'>
      <DeploymentForm />
      <ProviderForm service={service} gitProviders={gitProviders} />
      <BuildTypeForm service={service} />
    </div>
  )
}

export default GeneralTab
