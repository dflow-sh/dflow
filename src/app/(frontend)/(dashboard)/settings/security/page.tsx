import LayoutClient from '../../layout.client'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import CreateSSHKey from '@/components/security/CreateSSHKeyForm'
import CreateSecurityGroup from '@/components/security/CreateSecurityGroup'
import SSHKeysList from '@/components/security/SSHKeysList'
import SSHLoading from '@/components/security/SSHLoading'
import SecurityGroupsList from '@/components/security/SecurityGroupsList'
import SecurityGroupsLoading from '@/components/security/SecurityGroupsLoading'
import SecuritySidebar from '@/components/security/SecuritySidebar'

const SuspendedContent = async () => {
  const payload = await getPayload({ config: configPromise })

  // Fetch SSH keys
  const { docs: keys } = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  // Fetch security groups
  const { docs: securityGroups } = await payload.find({
    collection: 'securityGroups',
    pagination: false,
  })

  return (
    <div className='flex flex-col gap-10'>
      <section id='ssh-keys' className='pt-10'>
        <div className='mb-6 flex items-center justify-between'>
          <div className='text-2xl font-semibold'>SSH Keys</div>
          <CreateSSHKey />
        </div>
        {keys.length ? <SSHKeysList keys={keys} /> : <p>No SSH Keys Found!</p>}
      </section>

      <section id='security-groups' className='pt-10'>
        <div className='mb-6 flex items-center justify-between'>
          <div className='text-2xl font-semibold'>Security Groups</div>
          <CreateSecurityGroup />
        </div>
        {securityGroups.length ? (
          <SecurityGroupsList securityGroups={securityGroups} />
        ) : (
          <p>No Security Groups Found!</p>
        )}
      </section>
    </div>
  )
}

const SecurityPage = async () => {
  return (
    <LayoutClient>
      <div className='flex'>
        <SecuritySidebar />
        <div className='flex-1 px-6 py-6'>
          <h1 className='mb-6 text-3xl font-bold'>Security Settings</h1>
          <p className='mb-8 text-muted-foreground'>
            Manage your SSH keys and security groups for secure access to your
            infrastructure.
          </p>

          <Suspense
            fallback={
              <div className='flex flex-col gap-10'>
                <section>
                  <h2 className='mb-6 text-2xl font-semibold'>SSH Keys</h2>
                  <SSHLoading />
                </section>
                <section>
                  <h2 className='mb-6 text-2xl font-semibold'>
                    Security Groups
                  </h2>
                  <SecurityGroupsLoading />
                </section>
              </div>
            }>
            <SuspendedContent />
          </Suspense>
        </div>
      </div>
    </LayoutClient>
  )
}

export default SecurityPage
