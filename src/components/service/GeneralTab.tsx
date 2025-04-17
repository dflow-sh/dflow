import Loader from '../Loader'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

// import BuildTypeForm from './BuildTypeForm'
import { Service } from '@/payload-types'

import DatabaseForm from './DatabaseForm'
import DockerForm from './DockerForm'
import ProviderForm from './ProviderForm'

const AppComponent = async ({ service }: { service: Service }) => {
  const payload = await getPayload({ config: configPromise })

  const { docs: gitProviders } = await payload.find({
    collection: 'gitProviders',
    pagination: false,
  })

  return <ProviderForm service={service} gitProviders={gitProviders} />
}

const DatabaseComponent = ({ service }: { service: Service }) => {
  return (
    <div className='space-y-4'>
      <DatabaseForm service={service} />
    </div>
  )
}

const DockerComponent = async ({ service }: { service: Service }) => {
  const payload = await getPayload({ config: configPromise })

  const { docs: accounts } = await payload.find({
    collection: 'dockerRegistries',
    pagination: false,
  })

  return <DockerForm service={service} accounts={accounts} />
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
