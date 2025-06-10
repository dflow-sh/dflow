import LayoutClient from '../layout.client'
import { Suspense } from 'react'

import { getSecurityDetails } from '@/actions/pages/security'
import ServerTerminalClient from '@/components/ServerTerminalClient'
import SecurityTabs from '@/components/security/SecurityTabs'
import { SecuritySkeleton } from '@/components/skeletons/SecuritySkeleton'

const SuspendedPage = async () => {
  const result = await getSecurityDetails()

  const keys = result?.data?.keys ?? []
  const sshKeysCount = result?.data?.sshKeysCount ?? 0
  const securityGroups = result?.data?.securityGroups ?? []
  const securityGroupsCount = result?.data?.securityGroupsCount ?? 0
  const servers = result?.data?.servers ?? []
  const cloudProviderAccounts = result?.data?.cloudProviderAccounts ?? []

  return (
    <>
      <SecurityTabs
        sshKeysCount={sshKeysCount}
        securityGroupsCount={securityGroupsCount}
        keys={keys}
        securityGroups={securityGroups}
        cloudProviderAccounts={cloudProviderAccounts}
        servers={servers}
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
