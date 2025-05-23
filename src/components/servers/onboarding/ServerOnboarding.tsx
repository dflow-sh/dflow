'use client'

import { DokkuInstallationStepContextProvider } from '@/components/onboarding/dokkuInstallation/DokkuInstallationStepContext'
import UpdateManualServerFrom from '@/components/servers/AttachCustomServerForm'
import UpdateEC2InstanceForm from '@/components/servers/CreateEC2InstanceForm'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SecurityGroup, SshKey } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

import ConfigureDomain from './ConfigureDomain'
import DokkuInstallation from './DokkuInstallation'
import {
  ServerOnboardingProvider,
  useServerOnboarding,
} from './ServerOnboardingContext'

const ServerOnboardingContent = ({ server }: { server: ServerType }) => {
  const { currentStep } = useServerOnboarding()

  return (
    <>
      {currentStep === 1 && <DokkuInstallation server={server} />}
      {currentStep === 2 && <ConfigureDomain server={server} />}
    </>
  )
}

const ServerOnboarding = ({
  server,
  sshKeys,
  securityGroups,
}: {
  server: ServerType
  sshKeys: SshKey[]
  securityGroups: SecurityGroup[]
}) => {
  const UpdateServerForm = () => {
    if (server.provider === 'aws') {
      return (
        <UpdateEC2InstanceForm
          sshKeys={sshKeys}
          server={server}
          securityGroups={securityGroups}
          formType='update'
        />
      )
    }

    return (
      <UpdateManualServerFrom
        server={server}
        sshKeys={sshKeys}
        formType='update'
      />
    )
  }

  return (
    <ServerOnboardingProvider totalSteps={2}>
      <DokkuInstallationStepContextProvider>
        <Tabs defaultValue='onboarding'>
          <TabsList className='mb-4 grid w-max grid-cols-2'>
            <TabsTrigger value='onboarding'>Onboarding</TabsTrigger>
            <TabsTrigger value='configuration'>Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value='onboarding'>
            <ServerOnboardingContent server={server} />
          </TabsContent>

          <TabsContent value='configuration'>
            <Card>
              <CardContent className='pt-4'>
                <UpdateServerForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DokkuInstallationStepContextProvider>
    </ServerOnboardingProvider>
  )
}

export default ServerOnboarding
