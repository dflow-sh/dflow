import DomainList from '../DomainList'

import { ServerType } from '@/payload-types-overrides'

import ConfigureDefaultDomain from './ConfigureDefaultDomain'
import ServerOnboardingLayout from './ServerOnboardingLayout'

const ConfigureDomain = ({ server }: { server: ServerType }) => {
  const domains = server.domains ?? []

  return (
    <ServerOnboardingLayout
      server={server}
      cardTitle={'Configure Domain'}
      cardDescription={`🚀 Pro Tip: Don't have a domain no worries use nip.io wildcard domain: ${server.ip || server.publicIp}.nip.io`}
      disableNextStep={!domains.length}>
      <ConfigureDefaultDomain server={server} />

      <div className='mt-8'>
        {domains.length ? (
          <DomainList server={server} showSync={false} />
        ) : null}
      </div>
    </ServerOnboardingLayout>
  )
}

export default ConfigureDomain
