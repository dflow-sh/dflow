import AWSAccountForm from '../Integrations/aws/AWSAccountForm'
import SecurityGroupForm from '../security/CreateSecurityGroupForm'
import { Button } from '../ui/button'
import { DialogFooter } from '../ui/dialog'
import { Input } from '../ui/input'
import { MultiSelect } from '../ui/multi-select'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Plus } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { usePathname, useRouter } from 'next/navigation'
import { parseAsString, useQueryState } from 'nuqs'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { getCloudProvidersAccountsAction } from '@/actions/cloud'
import { createEC2InstanceAction } from '@/actions/cloud/aws'
import { createEC2InstanceSchema } from '@/actions/cloud/aws/validator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  amiList,
  awsRegions,
  instanceTypes,
  isDemoEnvironment,
} from '@/lib/constants'
import { CloudProviderAccount, SecurityGroup, SshKey } from '@/payload-types'

const CreateEC2InstanceForm = ({
  sshKeys,
  securityGroups,
  setOpen = () => {},
}: {
  sshKeys: SshKey[]
  securityGroups?: SecurityGroup[]
  setOpen?: Dispatch<SetStateAction<boolean>>
}) => {
  const [_type, setType] = useQueryState('type', parseAsString.withDefault(''))
  const [securityGroupDialogOpen, setSecurityGroupDialogOpen] = useState(false)

  const pathname = usePathname()
  const router = useRouter()
  const isOnboarding = pathname.includes('onboarding')

  const {
    execute: getAccounts,
    isPending: accountsPending,
    result: accountDetails,
  } = useAction(getCloudProvidersAccountsAction)

  const { execute: createEC2Instance, isPending: creatingEC2Instance } =
    useAction(createEC2InstanceAction, {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success('EC2 instance created successfully', {
            description:
              isOnboarding && 'redirecting to dokku-installation page...',
          })

          setOpen(false)

          if (isOnboarding) {
            router.push('/onboarding/dokku-install')
          }
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to create EC2 instance: ${error.serverError}`)
      },
    })

  const form = useForm<z.infer<typeof createEC2InstanceSchema>>({
    resolver: zodResolver(createEC2InstanceSchema),
    defaultValues: {
      name: '',
      sshKeyId: '',
      securityGroupIds: [],
      accountId: '',
      description: '',
      ami: 'ami-0e35ddab05955cf57',
      instanceType: 't3.large',
      diskSize: 80,
    },
  })

  useEffect(() => {
    getAccounts({ type: 'aws' })
  }, [])

  function onSubmit(values: z.infer<typeof createEC2InstanceSchema>) {
    createEC2Instance(values)
  }

  const selectedAwsAccountId = form.watch('accountId')

  const filteredSecurityGroups = securityGroups?.filter(
    securityGroup =>
      securityGroup.cloudProvider === 'aws' &&
      (securityGroup.cloudProviderAccount as CloudProviderAccount)?.id ===
        selectedAwsAccountId,
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-6'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='accountId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>AWS Account</FormLabel>
              <div className='flex items-center space-x-2'>
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
                      disabled={isDemoEnvironment}
                      onClick={e => e.stopPropagation()}
                      size='sm'
                      variant='outline'
                      className='m-0 h-fit shrink-0 p-2'>
                      <Plus className='h-4 w-4' />
                    </Button>
                  </AWSAccountForm>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='securityGroupIds'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Security Groups</FormLabel>
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
                  {isOnboarding && (
                    <Dialog
                      open={securityGroupDialogOpen}
                      onOpenChange={setSecurityGroupDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          disabled={isDemoEnvironment}
                          onClick={e => e.stopPropagation()}
                          size='sm'
                          variant='outline'
                          className='m-0 h-fit shrink-0 p-2'>
                          <Plus className='h-4 w-4' />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-4xl'>
                        <DialogHeader>
                          <DialogTitle>Add Security Group</DialogTitle>
                          <DialogDescription>
                            Create a new security group for your EC2 instance
                          </DialogDescription>
                        </DialogHeader>

                        <SecurityGroupForm
                          type='create'
                          setOpen={setSecurityGroupDialogOpen}
                          cloudProviderAccounts={accountDetails.data || []}
                          securityGroup={{
                            cloudProvider: 'aws',
                            cloudProviderAccount: form.watch('accountId'),
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='sshKeyId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>SSH key</FormLabel>

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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='ami'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amazon Machine Image (AMI)</FormLabel>

              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <FormLabel>Instance Type</FormLabel>

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
                <FormLabel>Disk Size (GiB)</FormLabel>
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
              <FormLabel>Region</FormLabel>

              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        <DialogFooter className='mt-6'>
          <Button variant='outline' onClick={() => setType(null)}>
            <ArrowLeft />
            Go back
          </Button>

          <Button type='submit' disabled={creatingEC2Instance}>
            Create EC2 Instance
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default CreateEC2InstanceForm
