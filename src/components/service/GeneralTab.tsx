import Loader from '../Loader'

import { getDockerRegistries } from '@/actions/dockerRegistry'
import { getAllAppsAction } from '@/actions/gitProviders'
import { Server, Service } from '@/payload-types'

import DatabaseForm from './DatabaseForm'
import DockerForm from './DockerForm'
import ProviderForm from './ProviderForm'

const AppComponent = async ({ service }: { service: Service }) => {
  const gitProvidersData = await getAllAppsAction()
  const gitProviders = gitProvidersData?.data ?? []

  return <ProviderForm service={service} gitProviders={gitProviders} />
}

const DatabaseComponent = ({
  service,
  server,
}: {
  service: Service
  server: Server | string
}) => {
  return (
    <div className='space-y-4'>
      <DatabaseForm service={service} server={server} />
    </div>
  )
}

const DockerComponent = async ({ service }: { service: Service }) => {
  const dockerRegistriesData = await getDockerRegistries()
  const accounts = dockerRegistriesData?.data ?? []

  return <DockerForm service={service} accounts={accounts} />
}

const GeneralTab = ({
  service,
  server,
}: {
  service: Service
  server: Server | string
}) => {
  switch (service.type) {
    case 'app':
      return <AppComponent service={service} />

    case 'database':
      return <DatabaseComponent service={service} server={server} />

    case 'docker':
      return <DockerComponent service={service} />

    default:
      return <Loader className='h-96 w-full' />
  }
}

export default GeneralTab
