'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ScrollArea } from '../ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { usePathname, useRouter } from 'next/navigation'
import { Dispatch, SetStateAction } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { SecurityGroup } from '@/payload-types'

// Define rule schema to use in the extended schema
const securityRuleSchema = z.object({
  protocol: z.enum(['tcp', 'udp', 'icmp', '-1']),
  fromPort: z.number().min(0).max(65535).optional(),
  toPort: z.number().min(0).max(65535).optional(),
  targetType: z.enum(['cidr', 'sg', 'prefix']),
  cidrValue: z.string().optional(),
  prefixListId: z.string().optional(),
  description: z.string().optional(),
})

// Extend the schema to include all fields from the updated PayloadCMS collection
const extendedSecurityGroupSchema = createSecurityGroupSchema.extend({
  cloudProviderAccount: z.string().optional(),
  groupId: z.string().min(1),
  rules: z.array(securityRuleSchema).min(1).default([]),
  tags: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .default([]),
})

// Use the extended schema type
type FormValues = z.infer<typeof extendedSecurityGroupSchema>

const CreateSecurityGroupForm = ({
  type = 'create',
  securityGroup,
  setOpen,
  cloudProviderAccounts = [],
}: {
  type?: 'create' | 'update'
  securityGroup?: SecurityGroup
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  cloudProviderAccounts?: { id: string; label: string }[]
}) => {
  const pathName = usePathname()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(extendedSecurityGroupSchema),
    defaultValues: {
      name: securityGroup?.name || '',
      description: securityGroup?.description || '',
      region: securityGroup?.region || '',
      groupId: securityGroup?.groupId || '',
      ruleType: securityGroup?.ruleType || 'ingress',
      vpcId: securityGroup?.vpcId || '',
      cloudProviderAccount:
        (securityGroup?.cloudProviderAccount as string) || '',
      // Use rules array from updated schema
      rules: securityGroup?.rules || [
        {
          protocol: 'tcp',
          fromPort: 0,
          toPort: 0,
          targetType: 'cidr',
          cidrValue: '',
          prefixListId: '',
          description: '',
        },
      ],
      tags: securityGroup?.tags || [],
    },
  })

  // Setup field array for security rules
  const {
    fields: ruleFields,
    append: appendRule,
    remove: removeRule,
  } = useFieldArray({
    control: form.control,
    name: 'rules',
  })

  // Setup field array for tags
  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control: form.control,
    name: 'tags',
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

  function onSubmit(values: FormValues) {
    if (type === 'update' && securityGroup) {
      updateSecurityGroup({
        id: securityGroup.id,
        ...values,
      })
    } else {
      createSecurityGroup(values)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-6'>
        <ScrollArea className='h-[60vh] pl-1 pr-4'>
          <div className='space-y-4'>
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
                    <FormDescription>
                      The ID of the security group in the cloud provider
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='cloudProviderAccount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cloud Provider Account</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select an account' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cloudProviderAccounts.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.label}
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
                name='vpcId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VPC ID (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='vpc-12345' />
                    </FormControl>
                    <FormDescription>
                      The ID of the VPC/Virtual Network this security group
                      belongs to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  <FormDescription>
                    Specify whether these are inbound or outbound rules
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator className='my-4' />

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium'>Security Rules</h3>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  appendRule({
                    protocol: 'tcp',
                    fromPort: 0,
                    toPort: 0,
                    targetType: 'cidr',
                    cidrValue: '',
                    prefixListId: '',
                    description: '',
                  })
                }>
                <Plus className='mr-2 h-4 w-4' />
                Add Rule
              </Button>
            </div>

            {ruleFields.map((field, index) => {
              const watchProtocol = form.watch(`rules.${index}.protocol`)
              const watchTargetType = form.watch(`rules.${index}.targetType`)

              return (
                <div key={field.id} className='space-y-4 rounded-md border p-4'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-medium'>Rule {index + 1}</h4>
                    {/* Only show the remove button if there's more than one rule */}
                    {ruleFields.length > 1 && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => removeRule(index)}
                        className='text-red-500 hover:text-red-600'>
                        <Trash2 className='mr-1 h-4 w-4' />
                        Remove
                      </Button>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`rules.${index}.protocol`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protocol</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select protocol' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='tcp'>TCP</SelectItem>
                            <SelectItem value='udp'>UDP</SelectItem>
                            <SelectItem value='icmp'>ICMP</SelectItem>
                            <SelectItem value='-1'>All</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchProtocol !== 'icmp' && watchProtocol !== '-1' && (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name={`rules.${index}.fromPort`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Port</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min={0}
                                max={65535}
                                {...field}
                                onChange={e =>
                                  field.onChange(parseInt(e.target.value, 10))
                                }
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`rules.${index}.toPort`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>To Port</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min={0}
                                max={65535}
                                {...field}
                                onChange={e =>
                                  field.onChange(parseInt(e.target.value, 10))
                                }
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name={`rules.${index}.targetType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select target type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='cidr'>CIDR Block</SelectItem>
                            <SelectItem value='sg'>Security Group</SelectItem>
                            <SelectItem value='prefix'>Prefix List</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchTargetType === 'cidr' && (
                    <FormField
                      control={form.control}
                      name={`rules.${index}.cidrValue`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CIDR Value</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='0.0.0.0/0' />
                          </FormControl>
                          <FormDescription>
                            CIDR notation (e.g., 0.0.0.0/0 for anywhere)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {watchTargetType === 'prefix' && (
                    <FormField
                      control={form.control}
                      name={`rules.${index}.prefixListId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prefix List ID</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='pl-12345' />
                          </FormControl>
                          <FormDescription>
                            ID of the prefix list
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name={`rules.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rule Description</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='Describe the purpose of this rule'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )
            })}
          </div>

          <Separator className='my-4' />

          <div className='mb-10 space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium'>Tags</h3>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => appendTag({ key: '', value: '' })}>
                <Plus className='mr-2 h-4 w-4' />
                Add Tag
              </Button>
            </div>

            {tagFields.length === 0 && (
              <div className='py-4 text-center text-gray-500'>
                No tags added. Click "Add Tag" to create a new tag.
              </div>
            )}

            {tagFields.map((field, index) => (
              <div key={field.id} className='flex items-end gap-3'>
                <FormField
                  control={form.control}
                  name={`tags.${index}.key`}
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Key</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`tags.${index}.value`}
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => removeTag(index)}
                  className='mb-2 text-red-500 hover:text-red-600'>
                  <Trash2 className='h-5 w-5' />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className='mt-6'>
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
