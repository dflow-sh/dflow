'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { usePathname, useRouter } from 'next/navigation'
import { Dispatch, SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  createSecurityGroupAction,
  updateSecurityGroupAction,
} from '@/actions/securityGroups'
import { createSecurityGroupSchema } from '@/actions/securityGroups/validator'
import { DialogFooter } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { SecurityGroup } from '@/payload-types'

const CreateSecurityGroupForm = ({
  type = 'create',
  securityGroup,
  setOpen,
}: {
  type?: 'create' | 'update'
  securityGroup?: SecurityGroup
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
}) => {
  const pathName = usePathname()
  const router = useRouter()

  const form = useForm<z.infer<typeof createSecurityGroupSchema>>({
    resolver: zodResolver(createSecurityGroupSchema),
    defaultValues: securityGroup
      ? {
          name: securityGroup.name,
          description: securityGroup.description || '',
          region: securityGroup.region,
          groupId: securityGroup.groupId,
          ruleType: securityGroup.ruleType,
          vpcId: securityGroup.vpcId || '',
        }
      : {
          name: '',
          description: '',
          region: '',
          groupId: '',
          ruleType: 'ingress',
          vpcId: '',
        },
  })

  const { execute: createSecurityGroup, isPending: isCreatingSecurityGroup } =
    useAction(createSecurityGroupAction, {
      onSuccess: ({ data, input }) => {
        if (data) {
          toast.success(`Successfully created ${input.name} security group`)
          form.reset()
          setOpen?.(false)
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to create security group: ${error.serverError}`)
      },
    })

  const { execute: updateSecurityGroup, isPending: isUpdatingSecurityGroup } =
    useAction(updateSecurityGroupAction, {
      onSuccess: ({ data, input }) => {
        if (data) {
          toast.success(`Successfully updated ${input.name} security group`)
          setOpen?.(false)
          form.reset()
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to update security group: ${error.serverError}`)
      },
    })

  function onSubmit(values: z.infer<typeof createSecurityGroupSchema>) {
    if (type === 'update' && securityGroup) {
      updateSecurityGroup({ id: securityGroup.id, ...values })
    } else {
      createSecurityGroup(values)
    }
  }

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
                <Input {...field} />
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

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='region'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='groupId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Security Group ID</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='sg-12345' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='ruleType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rule Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select rule type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='ingress'>Ingress (Inbound)</SelectItem>
                    <SelectItem value='egress'>Egress (Outbound)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='vpcId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>VPC ID (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='vpc-12345' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button
            type='submit'
            disabled={isCreatingSecurityGroup || isUpdatingSecurityGroup}
            className='w-full sm:w-auto'>
            {type === 'create' ? 'Add Security Group' : 'Update Security Group'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default CreateSecurityGroupForm
