'use client'

import AWSAccountForm from '../Integrations/aws/AWSAccountForm'
import SidebarToggleButton from '../SidebarToggleButton'
import CreateSSHKey from '../security/CreateSSHKey'
import CreateSecurityGroup from '../security/CreateSecurityGroup'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { usePathname, useRouter } from 'next/navigation'
import { parseAsString, useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { getCloudProvidersAccountsAction } from '@/actions/cloud'
import {
  createEC2InstanceAction,
  updateEC2InstanceAction,
} from '@/actions/cloud/aws'
import { createEC2InstanceSchema } from '@/actions/cloud/aws/validator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { amiList, awsRegions, instanceTypes } from '@/lib/constants'
import {
  CloudProviderAccount,
  SecurityGroup,
  Server,
  SshKey,
} from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

const CreateEC2InstanceForm = ({
  sshKeys = [],
  securityGroups = [],
  formType = 'create',
  server,
  onSuccess,
  onError,
}: {
  sshKeys?: SshKey[]
  securityGroups?: SecurityGroup[]
  formType?: 'create' | 'update'
  server?: ServerType | Server
  onSuccess?: (
    data:
      | {
          success: boolean
          server: Server
        }
      | undefined,
  ) => void
  onError?: (error: any) => void
}) => {
  const [_type, setType] = useQueryState('type', parseAsString.withDefault(''))
  const [securityGroupDialogOpen, setSecurityGroupDialogOpen] = useState(false)

  const pathname = usePathname()
  const router = useRouter()
  const isOnboarding = pathname.includes('onboarding')
  const isCreating = formType === 'create'

  // Get initial security groups for update form
  const getInitialSecurityGroups = () => {
    if (!server || !server.awsEc2Details?.securityGroups) return []

    return Array.isArray(server.awsEc2Details.securityGroups)
      ? server.awsEc2Details.securityGroups.map(sg =>
          typeof sg === 'string' ? sg : sg.id,
        )
      : []
  }

  // Fetch AWS accounts
  const {
    execute: getAccounts,
    isPending: accountsPending,
    result: accountDetails,
  } = useAction(getCloudProvidersAccountsAction)

  // Create EC2 instance action
  const { execute: createEC2Instance, isPending: creatingEC2Instance } =
    useAction(createEC2InstanceAction, {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success('EC2 instance created successfully', {
            description:
              isOnboarding && 'redirecting to dokku-installation page...',
          })

          form.reset()
        }

        onSuccess?.(data)
      },
      onError: ({ error }) => {
        toast.error(`Failed to create EC2 instance: ${error.serverError}`)

        onError?.(error)
      },
    })

  // Update EC2 instance action
  const { execute: updateEC2Instance, isPending: updatingEC2Instance } =
    useAction(updateEC2InstanceAction, {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success('EC2 instance updated successfully')

          form.reset()
        }

        onSuccess?.(data)
      },
      onError: ({ error }) => {
        toast.error(`Failed to update EC2 instance: ${error.serverError}`)

        onError?.(error)
      },
    })

  // Initialize form with appropriate default values
  const form = useForm<z.infer<typeof createEC2InstanceSchema>>({
    resolver: zodResolver(createEC2InstanceSchema),
    defaultValues: isCreating
      ? {
          name: '',
          sshKeyId: '',
          securityGroupIds: [],
          accountId: '',
          description: '',
          ami: 'ami-0e35ddab05955cf57',
          instanceType: 't3.large',
          diskSize: 80,
        }
      : {
          name: server?.name || '',
          description: server?.description || '',
          securityGroupIds: getInitialSecurityGroups(),
          accountId: (typeof server?.cloudProviderAccount === 'object'
            ? server?.cloudProviderAccount?.id
            : server?.cloudProviderAccount) as string,
          // These fields won't be editable in update mode, but include them for form validation
          sshKeyId: (typeof server?.sshKey === 'object'
            ? server?.sshKey?.id
            : server?.sshKey) as string,
          ami: server?.awsEc2Details?.imageId || '',
          instanceType: server?.awsEc2Details?.instanceType || '',
          diskSize: server?.awsEc2Details?.diskSize || 0,
          region: server?.awsEc2Details?.region || '',
        },
  })

  useEffect(() => {
    getAccounts({ type: 'aws' })
  }, [])

  function onSubmit(values: z.infer<typeof createEC2InstanceSchema>) {
    if (isCreating) {
      createEC2Instance(values)
    } else if (server) {
      updateEC2Instance({
        serverId: server.id,
        instanceId: server.awsEc2Details?.instanceId || '',
        accountId: (typeof server.cloudProviderAccount === 'object'
          ? server.cloudProviderAccount?.id
          : server.cloudProviderAccount) as string,
        name: values.name,
        description: values.description,
        securityGroupsIds: values.securityGroupIds,
      })
    }
  }

  const selectedAwsAccountId = form.watch('accountId')

  const filteredSecurityGroups = securityGroups?.filter(
    securityGroup =>
      (securityGroup.cloudProvider === 'aws' || !securityGroup.cloudProvider) &&
      ((securityGroup.cloudProviderAccount as CloudProviderAccount)?.id ===
        selectedAwsAccountId ||
        !securityGroup.cloudProviderAccount),
  )

  // Format timestamp to readable date (for update form)
  const formatDate = (timestamp: string | undefined | null) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-6'>
        {/* Basic Information - Always Editable */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name
                <SidebarToggleButton
                  directory='servers'
                  fileName='add-server-aws'
                  sectionId='#name'
                />
              </FormLabel>{' '}
              <FormControl>
                <Input {...field} className='rounded-sm' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Description
                <SidebarToggleButton
                  directory='servers'
                  fileName='add-server-aws'
                  sectionId='#description-optional'
                />
              </FormLabel>{' '}
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* AWS Account Selection - Only editable in create mode */}
        <FormField
          control={form.control}
          name='accountId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                AWS Account
                <SidebarToggleButton
                  directory='servers'
                  fileName='add-server-aws'
                  sectionId='#aws-account'
                />
              </FormLabel>{' '}
              <div className='flex items-center space-x-2'>
                {isCreating ? (
                  <>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={accountsPending}>
                          <SelectValue
                            placeholder={
                              accountsPending
                                ? 'Fetching account details...'
                                : 'Select a Account'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {accountDetails?.data?.map(({ name, id }) => (
                          <SelectItem key={id} value={id}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isOnboarding && (
                      <AWSAccountForm refetch={getAccounts}>
                        <Button
                          onClick={e => e.stopPropagation()}
                          size='sm'
                          type='button'
                          variant='outline'
                          className='m-0 h-fit shrink-0 p-2'>
                          <Plus className='h-4 w-4' />
                        </Button>
                      </AWSAccountForm>
                    )}
                  </>
                ) : (
                  <Input
                    value={
                      (typeof server?.cloudProviderAccount === 'object'
                        ? server?.cloudProviderAccount?.name
                        : accountDetails?.data?.find(
                            account =>
                              account.id === server?.cloudProviderAccount,
                          )?.name) || 'N/A'
                    }
                    disabled
                    className='bg-muted'
                  />
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SSH Key - Only editable in create mode */}
        <FormField
          control={form.control}
          name='sshKeyId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                SSH Key
                <SidebarToggleButton
                  directory='servers'
                  fileName='add-server-aws'
                  sectionId='#ssh-key'
                />
              </FormLabel>
              {isCreating ? (
                <div className='flex items-center space-x-2'>
                  <div className='flex-1'>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a SSH key' />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {sshKeys.map(({ name, id }) => (
                          <SelectItem key={id} value={id}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <CreateSSHKey
                    trigger={
                      <Button
                        onClick={(e: any) => e.stopPropagation()}
                        size='sm'
                        variant='outline'
                        type='button'
                        className='m-0 h-fit shrink-0 p-2'>
                        <Plus className='h-4 w-4' />
                      </Button>
                    }
                  />
                </div>
              ) : (
                <>
                  <Input
                    value={
                      typeof server?.sshKey === 'string'
                        ? server?.sshKey
                        : server?.sshKey?.name || 'N/A'
                    }
                    disabled
                    className='bg-muted'
                  />
                  <p className='mt-1 text-xs text-muted-foreground'>
                    SSH keys cannot be updated after instance creation
                  </p>
                </>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Security Groups - Always editable */}
        <FormField
          control={form.control}
          name='securityGroupIds'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Security Groups
                <SidebarToggleButton
                  directory='servers'
                  fileName='add-server-aws'
                  sectionId='#security-groups'
                />
              </FormLabel>{' '}
              <div className='flex items-center space-x-2'>
                <div className='flex-1'>
                  <MultiSelect
                    options={(filteredSecurityGroups || [])?.map(
                      ({ name, id }) => ({
                        label: name,
                        value: id,
                      }),
                    )}
                    onValueChange={field.onChange}
                    defaultValue={field.value || []}
                    placeholder={
                      !filteredSecurityGroups ||
                      filteredSecurityGroups.length === 0
                        ? 'No security groups available'
                        : 'Select security groups'
                    }
                    className='w-full'
                  />
                </div>

                <CreateSecurityGroup
                  type='create'
                  cloudProviderAccounts={accountDetails?.data || []}
                  securityGroup={{
                    cloudProvider: 'aws',
                    cloudProviderAccount: form.watch('accountId'),
                  }}
                  trigger={
                    <Button
                      onClick={e => e.stopPropagation()}
                      size='sm'
                      variant='outline'
                      type='button'
                      className='m-0 h-fit shrink-0 p-2'>
                      <Plus className='h-4 w-4' />
                    </Button>
                  }
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* AMI, Instance Type, Disk Size, Region - Only editable in create mode */}
        {isCreating ? (
          <>
            <FormField
              control={form.control}
              name='ami'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Amazon Machine Image (AMI)
                    <SidebarToggleButton
                      directory='servers'
                      fileName='add-server-aws'
                      sectionId='#amazon-machine-image-ami'
                    />
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a AMI' />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {amiList.map(({ label, value }) => (
                        <SelectItem key={value} value={value}>
                          {`${label} (${value})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='instanceType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Instance Type
                      <SidebarToggleButton
                        directory='servers'
                        fileName='add-server-aws'
                        sectionId='#instance-type'
                      />
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a Instance' />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {instanceTypes.map(({ label, value }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='diskSize'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Disk Size (GiB)
                      <SidebarToggleButton
                        directory='servers'
                        fileName='add-server-aws'
                        sectionId='#disk-size-gib'
                      />
                    </FormLabel>{' '}
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        className='rounded-sm'
                        onChange={e => {
                          form.setValue('diskSize', +e.target.value, {
                            shouldValidate: true,
                          })
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='region'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Region
                    <SidebarToggleButton
                      directory='servers'
                      fileName='add-server-aws'
                      sectionId='#server'
                    />
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a Region' />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {awsRegions.map(({ label, value }) => (
                        <SelectItem key={value} value={value}>
                          {`${label} (${value})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : server ? (
          /* Instance details accordion - Only for update mode */
          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='instance-details'>
              <AccordionTrigger className='text-lg font-medium'>
                Instance Details
              </AccordionTrigger>
              <AccordionContent>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <FormLabel>Instance ID</FormLabel>
                    <Input
                      value={server.awsEc2Details?.instanceId || 'N/A'}
                      disabled
                      className='bg-muted'
                    />
                  </div>

                  <div>
                    <FormLabel>Region</FormLabel>
                    <Input
                      value={server.awsEc2Details?.region || 'N/A'}
                      disabled
                      className='bg-muted'
                    />
                  </div>
                </div>

                <div className='mt-4 grid grid-cols-2 gap-4'>
                  <div>
                    <FormLabel>Instance Type</FormLabel>
                    <Input
                      value={server.awsEc2Details?.instanceType || 'N/A'}
                      disabled
                      className='bg-muted'
                    />
                  </div>

                  <div>
                    <FormLabel>Public IP Address</FormLabel>
                    <Input
                      value={
                        server.awsEc2Details?.publicIpAddress ||
                        server.ip ||
                        'N/A'
                      }
                      disabled
                      className='bg-muted'
                    />
                  </div>
                </div>

                <div className='mt-4 grid grid-cols-2 gap-4'>
                  <div>
                    <FormLabel>Private IP Address</FormLabel>
                    <Input
                      value={server.awsEc2Details?.privateIpAddress || 'N/A'}
                      disabled
                      className='bg-muted'
                    />
                  </div>

                  <div>
                    <FormLabel>Key Name</FormLabel>
                    <Input
                      value={server.awsEc2Details?.keyName || 'N/A'}
                      disabled
                      className='bg-muted'
                    />
                  </div>
                </div>

                <div className='mt-4 grid grid-cols-2 gap-4'>
                  <div>
                    <FormLabel>AMI ID</FormLabel>
                    <Input
                      value={server.awsEc2Details?.imageId || 'N/A'}
                      disabled
                      className='bg-muted'
                    />
                  </div>

                  <div>
                    <FormLabel>Architecture</FormLabel>
                    <Input
                      value={server.awsEc2Details?.architecture || 'N/A'}
                      disabled
                      className='bg-muted'
                    />
                  </div>
                </div>

                <div className='mt-4 grid grid-cols-2 gap-4'>
                  <div>
                    <FormLabel>State</FormLabel>
                    <Input
                      value={server.awsEc2Details?.state || 'N/A'}
                      disabled
                      className='bg-muted'
                    />
                  </div>

                  <div>
                    <FormLabel>Disk Size</FormLabel>
                    <Input
                      value={
                        server.awsEc2Details?.diskSize
                          ? `${server.awsEc2Details.diskSize} GB`
                          : 'N/A'
                      }
                      disabled
                      className='bg-muted'
                    />
                  </div>
                </div>

                <div className='mt-4 grid grid-cols-2 gap-4'>
                  <div>
                    <FormLabel>Launch Time</FormLabel>
                    <Input
                      value={formatDate(server.awsEc2Details?.launchTime)}
                      disabled
                      className='bg-muted'
                    />
                  </div>

                  <div>
                    <FormLabel>Username</FormLabel>
                    <Input
                      value={server.username || 'N/A'}
                      disabled
                      className='bg-muted'
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='network-details'>
              <AccordionTrigger className='text-lg font-medium'>
                Network Details
              </AccordionTrigger>
              <AccordionContent>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <FormLabel>VPC ID</FormLabel>
                    <Input
                      value={server.awsEc2Details?.vpcId || 'N/A'}
                      disabled
                      className='bg-muted'
                    />
                  </div>

                  <div>
                    <FormLabel>Subnet ID</FormLabel>
                    <Input
                      value={server.awsEc2Details?.subnetId || 'N/A'}
                      disabled
                      className='bg-muted'
                    />
                  </div>
                </div>

                <div className='mt-4 grid grid-cols-2 gap-4'>
                  <div>
                    <FormLabel>Public DNS Name</FormLabel>
                    <Input
                      value={server.awsEc2Details?.publicDnsName || 'N/A'}
                      disabled
                      className='bg-muted'
                    />
                  </div>

                  <div>
                    <FormLabel>Private DNS Name</FormLabel>
                    <Input
                      value={server.awsEc2Details?.privateDnsName || 'N/A'}
                      disabled
                      className='bg-muted'
                    />
                  </div>
                </div>

                <div className='mt-4'>
                  <FormLabel>SSH Port</FormLabel>
                  <Input
                    value={server.port?.toString() || '22'}
                    disabled
                    className='bg-muted'
                  />
                </div>

                {server.domains && server.domains.length > 0 && (
                  <div className='mt-4'>
                    <FormLabel>Domains</FormLabel>
                    <div className='mt-1 flex flex-wrap gap-2'>
                      {server.domains.map((domain, index) => (
                        <Badge
                          key={index}
                          variant={domain.default ? 'default' : 'outline'}>
                          {domain.domain} {domain.default && '(Default)'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='metadata'>
              <AccordionTrigger className='text-lg font-medium'>
                Instance Metadata
              </AccordionTrigger>
              <AccordionContent>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <FormLabel>Created At</FormLabel>
                    <Input
                      value={formatDate(server.createdAt)}
                      disabled
                      className='bg-muted'
                    />
                  </div>

                  <div>
                    <FormLabel>Last Updated</FormLabel>
                    <Input
                      value={formatDate(server.updatedAt)}
                      disabled
                      className='bg-muted'
                    />
                  </div>
                </div>

                <div className='mt-4 grid grid-cols-2 gap-4'>
                  <div>
                    <FormLabel>Provider</FormLabel>
                    <Input
                      value={server.provider?.toUpperCase() || 'N/A'}
                      disabled
                      className='bg-muted'
                    />
                  </div>

                  <div>
                    <FormLabel>Onboarded</FormLabel>
                    <Input
                      value={server.onboarded ? 'Yes' : 'No'}
                      disabled
                      className='bg-muted'
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : null}

        <div className='flex w-full items-center justify-end'>
          <Button
            type='submit'
            disabled={isCreating ? creatingEC2Instance : updatingEC2Instance}>
            {isCreating
              ? creatingEC2Instance
                ? 'Creating...'
                : 'Create EC2 Instance'
              : updatingEC2Instance
                ? 'Updating...'
                : 'Update Instance'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default CreateEC2InstanceForm
