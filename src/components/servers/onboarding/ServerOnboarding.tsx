'use client'

import { DokkuInstallationStepContextProvider } from '@/components/onboarding/dokkuInstallation/DokkuInstallationStepContext'
import { ServerType } from '@/payload-types-overrides'

import ConfigureDomain from './ConfigureDomain'
import DokuInstallation from './DokuInstallation'
import {
  ServerOnboardingProvider,
  useServerOnboarding,
} from './ServerOnboardingContext'

const ServerOnboardingContent = ({ server }: { server: ServerType }) => {
  const { currentStep } = useServerOnboarding()

  return (
    <>
      {currentStep === 1 && <DokuInstallation server={server} />}

      {currentStep === 2 && <ConfigureDomain server={server} />}
    </>
  )
}

const ServerOnboarding = ({ server }: { server: ServerType }) => {
  return (
    <ServerOnboardingProvider totalSteps={2}>
      <DokkuInstallationStepContextProvider>
        <ServerOnboardingContent server={server} />
      </DokkuInstallationStepContextProvider>
    </ServerOnboardingProvider>
  )
}

export default ServerOnboarding
