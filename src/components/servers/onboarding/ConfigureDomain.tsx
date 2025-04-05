'use client'

import { DomainFormWithoutDialog } from '../DomainForm'
import DomainList from '../DomainList'

import { ServerType } from '@/payload-types-overrides'

import { useServerOnboarding } from './ServerOnboardingContext'
import ServerOnboardingLayout from './ServerOnboardingLayout'

const ConfigureDomain = ({ server }: { server: ServerType }) => {
  const { currentStep, totalSteps } = useServerOnboarding()
  const isDomainConfigured = !!(server.domains ?? []).length

  return (
    <ServerOnboardingLayout
      server={server}
      cardTitle={'Configure Domain'}
      cardDescription={`🚀 Pro Tip: Don't have a domain no worries use nip.io wildcard domain: ${server.ip}.nip.io`}
      disableNextStep={isDomainConfigured}>
      <DomainFormWithoutDialog server={server} />

      <div className='mt-8'>
        {isDomainConfigured ? (
          <DomainList showForm={false} server={server} />
        ) : null}
      </div>
    </ServerOnboardingLayout>
  )
}

export default ConfigureDomain
