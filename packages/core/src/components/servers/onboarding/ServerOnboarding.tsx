'use client'

import { DokkuInstallationStepContextProvider } from "@core/components/onboarding/dokkuInstallation/DokkuInstallationStepContext"
import UpdateManualServerFrom from "@core/components/servers/AttachCustomServerForm"
import UpdateEC2InstanceForm from "@core/components/servers/CreateEC2InstanceForm"
import UpdateTailscaleServerForm from "@core/components/servers/UpdateTailscaleServerForm"
import { Card, CardContent } from "@core/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/components/ui/tabs"
import { SecurityGroup, SshKey } from "@core/payload-types"
import { ServerType } from "@core/payload-types-overrides"

import ConfigureDomain from "@core/components/servers/onboarding/ConfigureDomain"
import {
  ServerOnboardingProvider,
  useServerOnboarding,
} from "@core/components/servers/onboarding/ServerOnboardingContext"
import ServerSetup from "@core/components/servers/onboarding/ServerSetup"

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
