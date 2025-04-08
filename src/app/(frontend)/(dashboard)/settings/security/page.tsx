import LayoutClient from '../../layout.client'
import configPromise from '@payload-config'
import { KeyRound, Shield } from 'lucide-react'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import CreateSSHKey from '@/components/security/CreateSSHKeyForm'
import CreateSecurityGroup from '@/components/security/CreateSecurityGroup'
import SSHKeysList from '@/components/security/SSHKeysList'
import SecurityGroupsList from '@/components/security/SecurityGroupsList'
import TabSkeleton from '@/components/security/TabSkeleton'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
    <>
      <TabsContent value='ssh-keys' className='mt-4'>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-2xl'>SSH Keys</CardTitle>
              <CreateSSHKey />
            </div>
            <CardDescription>
              Manage SSH keys for secure access to your resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            {keys.length ? (
              <SSHKeysList keys={keys} />
            ) : (
              <p className='py-4 text-center text-muted-foreground'>
                No SSH Keys Found!
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='security-groups' className='mt-4'>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-2xl'>Security Groups</CardTitle>
              <CreateSecurityGroup />
            </div>
            <CardDescription>
              Configure security groups to control traffic to your
              infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent>
            {securityGroups.length ? (
              <SecurityGroupsList securityGroups={securityGroups} />
            ) : (
              <p className='py-4 text-center text-muted-foreground'>
                No Security Groups Found!
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </>
  )
}

const SecurityPage = async () => {
  const payload = await getPayload({ config: configPromise })

  // Fetch counts only for the tabs
  const { totalDocs: sshKeysCount } = await payload.find({
    collection: 'sshKeys',
    limit: 0,
  })

  const { totalDocs: securityGroupsCount } = await payload.find({
    collection: 'securityGroups',
    limit: 0,
  })

  return (
    <LayoutClient>
      <div>
        <div className='mb-8'>
          <div className='text-2xl font-semibold'>Security Settings</div>
          <p className='mt-2 text-sm text-muted-foreground'>
            Manage your SSH keys and security groups for secure access to your
            infrastructure.
          </p>
        </div>

        <Tabs defaultValue='ssh-keys' className='w-full'>
          <TabsList className='grid w-full max-w-md grid-cols-2'>
            <TabsTrigger value='ssh-keys' className='flex items-center gap-2'>
              <KeyRound className='h-4 w-4' />
              <span>SSH Keys</span>
              <Badge variant='outline' className='ml-1 px-1.5 text-xs'>
                {sshKeysCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value='security-groups'
              className='flex items-center gap-2'>
              <Shield className='h-4 w-4' />
              <span>Security Groups</span>
              <Badge variant='outline' className='ml-1 px-1.5 text-xs'>
                {securityGroupsCount}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <Suspense
            fallback={
              <>
                <TabsContent value='ssh-keys' className='mt-4'>
                  <TabSkeleton title='SSH Keys' />
                </TabsContent>
                <TabsContent value='security-groups' className='mt-4'>
                  <TabSkeleton title='Security Groups' />
                </TabsContent>
              </>
            }>
            <SuspendedContent />
          </Suspense>
        </Tabs>
      </div>
    </LayoutClient>
  )
}

export default SecurityPage
