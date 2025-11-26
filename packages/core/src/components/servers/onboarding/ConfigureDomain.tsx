import DomainList from "@core/components/servers/DomainList"

import { ServerType } from "@core/payload-types-overrides"

import ConfigureDefaultDomain from "@core/components/servers/onboarding/ConfigureDefaultDomain"
import ServerOnboardingLayout from "@core/components/servers/onboarding/ServerOnboardingLayout"

const ConfigureDomain = ({ server }: { server: ServerType }) => {
  const domains = server.domains ?? []

  return (
    <ServerOnboardingLayout
      server={server}
      cardTitle={'Configure Domain'}
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
