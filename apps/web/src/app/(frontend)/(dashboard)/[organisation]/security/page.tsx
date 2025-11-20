import LayoutClient from '../layout.client'
import { Suspense } from 'react'

import {
  getSecurityDetailsAction,
  getSshKeysAction,
} from '@dflow/actions/pages/security'
import SecurityTabs from '@dflow/components/security/SecurityTabs'
import { SecuritySkeleton } from '@dflow/components/skeletons/SecuritySkeleton'

const SuspendedPage = async () => {
  const securityGroupDetails = await getSecurityDetailsAction()

  const sshKeysDetails = await getSshKeysAction()

  const keys = sshKeysDetails?.data?.keys ?? []
  const sshKeysCount = sshKeysDetails?.data?.sshKeysCount ?? 0
  const securityGroups = securityGroupDetails?.data?.securityGroups ?? []
  const securityGroupsCount =
    securityGroupDetails?.data?.securityGroupsCount ?? 0
  const sshServers = sshKeysDetails?.data?.servers ?? []
  const securityGroupServers = securityGroupDetails?.data?.servers ?? []
  const cloudProviderAccounts =
    securityGroupDetails?.data?.cloudProviderAccounts ?? []

  const sshError = sshKeysDetails?.serverError
  const securityGroupError = securityGroupDetails?.serverError

  return (
    <>
      <SecurityTabs
        sshKeysCount={sshKeysCount}
        securityGroupsCount={securityGroupsCount}
        keys={keys}
        securityGroups={securityGroups}
        cloudProviderAccounts={cloudProviderAccounts}
        sshServers={sshServers}
        securityGroupServers={securityGroupServers}
        sshError={sshError}
        securityGroupError={securityGroupError}
      />

      {/* <ServerTerminalClient servers={sshServers || securityGroupServers} /> */}
    </>
  )
}

const SecurityPage = async () => {
  return (
    <LayoutClient>
      <div className='mb-8'>
        <div className='text-2xl font-semibold'>Security Settings</div>
        <p className='text-muted-foreground mt-2 text-sm'>
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
