import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import CloudProvidersList from '@/components/Integrations/CloudProvidersList'
import Loader from '@/components/Loader'
import Layout from '@/components/onboarding/OnboardingLayout'
import SecurityGroupsList from '@/components/security/SecurityGroupsList'
import ServerForm from '@/components/servers/ServerForm'
import ServerList from '@/components/servers/ServerList'
import { ServerType } from '@/payload-types-overrides'

const SuspendedPage = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  const { docs: sshKeys } = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  const { docs: securityGroups } = await payload.find({
    collection: 'securityGroups',
    pagination: false,
  })

  const { docs: cloudProviderAccounts } = await payload.find({
    collection: 'cloudProviderAccounts',
    pagination: false,
  })

  const { docs: servers } = await payload.find({
    collection: 'servers',
    pagination: false,
    context: {
      populateServerDetails: true,
    },
  })

  const hasServers = servers.length > 0
  const hasCloudProviderAccounts = cloudProviderAccounts.length > 0
  const hasSecurityGroups = securityGroups.length > 0

  return (
    <Layout
      currentStep={2}
      cardTitle='Server Management'
      cardDescription='Configure and manage your deployment servers. We recommend 8GB RAM for optimal performance.'
      prevStepUrl={'/onboarding/ssh-keys'}
      nextStepUrl={'/onboarding/dokku-install'}
      disableNextStep={hasServers}>
      {sshKeys.length === 0 && (
        <div className='mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-700'>
          You haven't added any SSH keys yet. SSH keys are required to securely
          connect to your servers.
        </div>
      )}

      <div className='space-y-8'>
        <section>
          <h2 className='mb-4 text-xl font-semibold'>Add a New Server</h2>
          <ServerForm sshKeys={sshKeys} securityGroups={securityGroups} />
        </section>

        {hasServers && (
          <section className='space-y-4'>
            <h2 className='mb-4 text-xl font-semibold'>Your Servers</h2>
            <ServerList servers={servers as ServerType[]} sshKeys={sshKeys} />
          </section>
        )}

        {hasCloudProviderAccounts && (
          <section>
            <h2 className='mb-4 text-xl font-semibold'>
              Cloud Provider Accounts
            </h2>
            <CloudProvidersList accounts={cloudProviderAccounts} />
          </section>
        )}

        {hasSecurityGroups && (
          <section>
            <h2 className='mb-4 text-xl font-semibold'>Security Groups</h2>
            <SecurityGroupsList
              cloudProviderAccounts={cloudProviderAccounts}
              securityGroups={securityGroups}
            />
          </section>
        )}
      </div>
    </Layout>
  )
}

export default async function Page() {
  return (
    <Suspense fallback={<Loader className='min-h-screen w-full' />}>
      <SuspendedPage />
    </Suspense>
  )
}
