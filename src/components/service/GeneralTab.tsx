import Loader from '../Loader'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { Service } from '@/payload-types'

import BuildTypeForm from './BuildTypeForm'
import DatabaseForm from './DatabaseForm'
import DeploymentForm from './DeploymentForm'
import ProviderForm from './ProviderForm'

const AppComponent = async ({ service }: { service: Service }) => {
  const payload = await getPayload({ config: configPromise })

  const { docs: gitProviders } = await payload.find({
    collection: 'gitProviders',
    pagination: false,
  })

  return (
    <div className='space-y-4'>
      <DeploymentForm service={service} />
      <ProviderForm service={service} gitProviders={gitProviders} />
      <BuildTypeForm service={service} />
    </div>
  )
}

const DatabaseComponent = ({ service }: { service: Service }) => {
  return (
    <div className='space-y-4'>
      <DeploymentForm service={service} />
      <DatabaseForm />
    </div>
  )
}

const DockerComponent = ({ service }: { service: Service }) => {
  return <p>Docker Form</p>
}

const GeneralTab = ({ service }: { service: Service }) => {
  switch (service.type) {
    case 'app':
      return <AppComponent service={service} />

    case 'database':
      return <DatabaseComponent service={service} />

    case 'docker':
      return <DockerComponent service={service} />

    default:
      return <Loader className='h-96 w-full' />
  }
}

export default GeneralTab
