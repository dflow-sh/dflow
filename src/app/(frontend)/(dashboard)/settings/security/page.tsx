import LayoutClient from '../../layout.client'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense, use } from 'react'

import SecurityTabs from '@/components/security/SecurityTabs'
import SecurityTabsSkeleton from '@/components/security/SecurityTabsSkeleton'

const SuspendedSecurityTabs = () => {
  const payload = use(getPayload({ config: configPromise }))

  const [
    { docs: keys, totalDocs: sshKeysCount },
    { docs: securityGroups, totalDocs: securityGroupsCount },
    { docs: cloudProviderAccounts },
  ] = use(
    Promise.all([
      payload.find({ collection: 'sshKeys', pagination: false }),
      payload.find({ collection: 'securityGroups', pagination: false }),
      payload.find({ collection: 'cloudProviderAccounts', pagination: false }),
    ]),
  )

  return (
    <SecurityTabs
      sshKeysCount={sshKeysCount}
      securityGroupsCount={securityGroupsCount}
      keys={keys}
      securityGroups={securityGroups}
      cloudProviderAccounts={cloudProviderAccounts}
    />
  )
}

const SecurityPage = async () => {
  return (
    <LayoutClient>
      <div className='mb-8'>
        <div className='text-2xl font-semibold'>Security Settings</div>
        <p className='mt-2 text-sm text-muted-foreground'>
          Manage your SSH keys and security groups for secure access to your
          infrastructure.
        </p>
      </div>
      <Suspense fallback={<SecurityTabsSkeleton />}>
        <SuspendedSecurityTabs />
      </Suspense>
    </LayoutClient>
  )
}

export default SecurityPage
