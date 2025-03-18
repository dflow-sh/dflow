import Loader from '../Loader'
import configPromise from '@payload-config'
import { TriangleAlert } from 'lucide-react'
import { getPayload } from 'payload'

// import BuildTypeForm from './BuildTypeForm'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Service } from '@/payload-types'

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
      <Alert variant='info'>
        <TriangleAlert className='h-4 w-4' />

        <AlertTitle>We currently support Dockerfile deployments</AlertTitle>
        <AlertDescription className='flex w-full flex-col justify-between gap-2 md:flex-row'>
          <p>
            We're actively working on adding support for buildpack-based
            deployments—stay tuned!
          </p>
        </AlertDescription>
      </Alert>

      <DeploymentForm service={service} />
      <ProviderForm service={service} gitProviders={gitProviders} />
      {/* <BuildTypeForm service={service} /> */}
    </div>
  )
}

const DatabaseComponent = ({ service }: { service: Service }) => {
  return (
    <div className='space-y-4'>
      <DeploymentForm service={service} />
      <DatabaseForm service={service} />
    </div>
  )
}

const DockerComponent = async ({ service }: { service: Service }) => {
  const payload = await getPayload({ config: configPromise })

  const { docs: gitProviders } = await payload.find({
    collection: 'gitProviders',
    pagination: false,
  })

  return (
    <div className='space-y-4'>
      <DeploymentForm service={service} />
      <ProviderForm service={service} gitProviders={gitProviders} />
    </div>
  )
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
