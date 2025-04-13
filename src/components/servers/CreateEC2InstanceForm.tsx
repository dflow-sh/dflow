import { Button } from '../ui/button'
import { DialogFooter } from '../ui/dialog'
import { Input } from '../ui/input'
import { MultiSelect } from '../ui/multi-select'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { getCloudProvidersAccountsAction } from '@/actions/cloud'
import { createEC2InstanceAction } from '@/actions/cloud/aws'
import { createEC2InstanceSchema } from '@/actions/cloud/aws/validator'
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
import { amiList, awsRegions, instanceTypes } from '@/lib/constants'
import { CloudProviderAccount, SecurityGroup, SshKey } from '@/payload-types'

const CreateEC2InstanceForm = ({
  sshKeys,
  securityGroups,
  setOpen = () => {},
}: {
  sshKeys: SshKey[]
  securityGroups: SecurityGroup[]
  setOpen?: Dispatch<SetStateAction<boolean>>
}) => {
  const {
    execute: getAccounts,
    isPending: accountsPending,
    result: accountDetails,
  } = useAction(getCloudProvidersAccountsAction)
  const { execute: createEC2Instance, isPending: creatingEC2Instance } =
    useAction(createEC2InstanceAction, {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success('EC2 instance created successfully')
          setOpen(false)
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
      (securityGroup.cloudProviderAccount as CloudProviderAccount).id ===
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

              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <MultiSelect
                  options={filteredSecurityGroups.map(({ name, id }) => ({
                    label: name,
                    value: id,
                  }))}
                  onValueChange={field.onChange}
                  defaultValue={field.value || []}
                  placeholder='Select security groups'
                  className='w-full'
                />
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

        <DialogFooter>
          <Button type='submit' disabled={creatingEC2Instance} className='mt-6'>
            Create EC2 Instance
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default CreateEC2InstanceForm
