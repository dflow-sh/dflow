import LayoutClient from '../layout.client'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense, use } from 'react'

import ServerTerminalClient from '@/components/ServerTerminalClient'
import SecurityTabs from '@/components/security/SecurityTabs'
import { SecuritySkeleton } from '@/components/skeletons/SecuritySkeleton'

const SuspendedPage = () => {
  const payload = use(getPayload({ config: configPromise }))

  const [
    { docs: keys, totalDocs: sshKeysCount },
    { docs: securityGroups, totalDocs: securityGroupsCount },
    { docs: cloudProviderAccounts },
    { docs: servers },
  ] = use(
    Promise.all([
      payload.find({ collection: 'sshKeys', pagination: false }),
      payload.find({ collection: 'securityGroups', pagination: false }),
      payload.find({ collection: 'cloudProviderAccounts', pagination: false }),
      payload.find({
        collection: 'servers',
        pagination: false,
        select: {
          name: true,
        },
      }),
    ]),
  )

  return (
    <>
      <SecurityTabs
        sshKeysCount={sshKeysCount}
        securityGroupsCount={securityGroupsCount}
        keys={keys}
        securityGroups={securityGroups}
        cloudProviderAccounts={cloudProviderAccounts}
      />
      <ServerTerminalClient servers={servers} />
    </>
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
      <Suspense fallback={<SecuritySkeleton />}>
        <SuspendedPage />
      </Suspense>
    </LayoutClient>
  )
}

export default SecurityPage
