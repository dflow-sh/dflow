'use client'

import { DokkuInstallationStepContextProvider } from '@dflow/core/components/onboarding/dokkuInstallation/DokkuInstallationStepContext'
import UpdateManualServerFrom from '@dflow/core/components/servers/AttachCustomServerForm'
import UpdateEC2InstanceForm from '@dflow/core/components/servers/CreateEC2InstanceForm'
import UpdateTailscaleServerForm from '@dflow/core/components/servers/UpdateTailscaleServerForm'
import { Card, CardContent } from '@dflow/core/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@dflow/core/components/ui/tabs'
import { SecurityGroup, SshKey } from '@dflow/core/payload-types'
import { ServerType } from '@dflow/core/payload-types-overrides'

import ConfigureDomain from './ConfigureDomain'
import {
  ServerOnboardingProvider,
  useServerOnboarding,
} from './ServerOnboardingContext'
import ServerSetup from './ServerSetup'

const ServerOnboardingContent = ({
  server,
  s3Enabled,
}: {
  server: ServerType
  s3Enabled: boolean
}) => {
  const { currentStep } = useServerOnboarding()

  return (
    <>
      {currentStep === 1 ? (
        <ServerSetup server={server} s3Enabled={s3Enabled} />
      ) : (
        <ConfigureDomain server={server} />
      )}
    </>
  )
}

const ServerOnboarding = ({
  server,
  sshKeys,
  securityGroups,
  s3Enabled,
}: {
  server: ServerType
  sshKeys: SshKey[]
  securityGroups: SecurityGroup[]
  s3Enabled: boolean
}) => {
  return (
    <ServerOnboardingProvider totalSteps={2}>
      <DokkuInstallationStepContextProvider>
        <Tabs defaultValue='onboarding'>
          <TabsList className='mb-4 grid w-max grid-cols-2'>
            <TabsTrigger value='onboarding'>Onboarding</TabsTrigger>
            <TabsTrigger value='configuration'>Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value='onboarding'>
            <ServerOnboardingContent server={server} s3Enabled={s3Enabled} />
          </TabsContent>

          <TabsContent value='configuration'>
            <Card>
              <CardContent className='pt-4'>
                {server.provider === 'aws' ? (
                  <UpdateEC2InstanceForm
                    sshKeys={sshKeys}
                    server={server}
                    securityGroups={securityGroups}
                    formType='update'
                  />
                ) : server.preferConnectionType === 'tailscale' ? (
                  <UpdateTailscaleServerForm
                    server={server}
                    formType='update'
                  />
                ) : (
                  <UpdateManualServerFrom
                    server={server}
                    sshKeys={sshKeys}
                    formType='update'
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DokkuInstallationStepContextProvider>
    </ServerOnboardingProvider>
  )
}

export default ServerOnboarding
