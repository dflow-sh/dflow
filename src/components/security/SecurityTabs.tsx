'use client'

import { KeyRound, Shield } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect } from 'react'

import CreateSSHKey from '@/components/security/CreateSSHKey'
import CreateSecurityGroup from '@/components/security/CreateSecurityGroup'
import SSHKeysList from '@/components/security/SSHKeysList'
import SecurityGroupsList from '@/components/security/SecurityGroupsList'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CloudProviderAccount,
  SecurityGroup,
  Server,
  SshKey,
} from '@/payload-types'

interface Props {
  sshKeysCount: number
  securityGroupsCount: number
  keys: SshKey[]
  securityGroups: SecurityGroup[]
  cloudProviderAccounts: CloudProviderAccount[]
  servers: Partial<Server>[]
}

const SecurityTabs = ({
  sshKeysCount,
  securityGroupsCount,
  keys,
  securityGroups,
  cloudProviderAccounts,
  servers,
}: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'ssh-keys'

  useEffect(() => {
    if (!searchParams.get('tab')) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', 'ssh-keys')
      router.replace(`?${params.toString()}`)
    }
  }, [searchParams, router])

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', value)
      router.push(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className='w-full'>
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
              <SSHKeysList keys={keys} servers={servers} />
            ) : (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <KeyRound className='mb-4 h-12 w-12 text-muted-foreground opacity-20' />
                <p className='text-muted-foreground'>No SSH Keys Found</p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Add your first SSH key to securely access your resources
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='security-groups' className='mt-4'>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-2xl'>Security Groups</CardTitle>
              <CreateSecurityGroup
                cloudProviderAccounts={cloudProviderAccounts}
              />
            </div>
            <CardDescription>
              Configure security groups to control traffic to your
              infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent>
            {securityGroups.length ? (
              <SecurityGroupsList
                securityGroups={securityGroups}
                cloudProviderAccounts={cloudProviderAccounts}
                servers={servers}
              />
            ) : (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <Shield className='mb-4 h-12 w-12 text-muted-foreground opacity-20' />
                <p className='text-muted-foreground'>
                  No Security Groups Found
                </p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Create a security group to control access to your resources
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export default SecurityTabs
