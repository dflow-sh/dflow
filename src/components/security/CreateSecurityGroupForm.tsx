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
import { Plus, ShieldAlert, ShieldCheck, Tag, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
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
import { CloudProviderAccount, SecurityGroup } from '@/payload-types'

// Inbound rule schema
const inboundRuleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum([
    'all-traffic',
    'custom-tcp',
    'custom-udp',
    'custom-icmp',
    'ssh',
    'https',
    'http',
    'rdp',
    'custom',
  ]),
  protocol: z.enum(['tcp', 'udp', 'icmp', 'all']),
  fromPort: z.number().min(0).max(65535),
  toPort: z.number().min(0).max(65535),
  sourceType: z.enum(['my-ip', 'anywhere-ipv4', 'anywhere-ipv6', 'custom']),
  source: z.string(),
})

// Outbound rule schema
const outboundRuleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum([
    'all-traffic',
    'custom-tcp',
    'custom-udp',
    'custom-icmp',
    'ssh',
    'https',
    'http',
    'rdp',
    'custom',
  ]),
  protocol: z.enum(['tcp', 'udp', 'icmp', 'all']),
  fromPort: z.number().min(0).max(65535),
  toPort: z.number().min(0).max(65535),
  destinationType: z.enum([
    'my-ip',
    'anywhere-ipv4',
    'anywhere-ipv6',
    'custom',
  ]),
  destination: z.string(),
})

// Define tag schema
const tagSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string().optional(),
})

// Define the extended schema for the form
const extendedSecurityGroupSchema = createSecurityGroupSchema.extend({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  cloudProvider: z.enum(['aws', 'azure', 'gcp', 'digitalocean']),
  cloudProviderAccount: z.string().min(1, 'Cloud Provider Account is required'),
  inboundRules: z.array(inboundRuleSchema).optional().default([]),
  outboundRules: z.array(outboundRuleSchema).optional().default([]),
  tags: z.array(tagSchema).optional().default([]),
})

type FormValues = z.infer<typeof extendedSecurityGroupSchema>

const SecurityGroupForm = ({
  type = 'create',
  securityGroup,
  open,
  setOpen,
  cloudProviderAccounts = [],
}: {
  type?: 'create' | 'update'
  securityGroup?: SecurityGroup
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  cloudProviderAccounts: CloudProviderAccount[]
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(extendedSecurityGroupSchema),
    defaultValues: {
      name: securityGroup?.name || '',
      description: securityGroup?.description || '',
      cloudProvider: (securityGroup?.cloudProvider as any) || 'aws',
      cloudProviderAccount:
        ((securityGroup?.cloudProviderAccount as CloudProviderAccount)
          ?.id as string) || '',
      inboundRules: (securityGroup?.inboundRules as any[]) || [
        {
          name: '',
          description: '',
          type: 'custom-tcp',
          protocol: 'tcp',
          fromPort: 0,
          toPort: 0,
          sourceType: 'custom',
          source: '',
        },
      ],
      outboundRules: (securityGroup?.outboundRules as any[]) || [
        {
          name: '',
          description: '',
          type: 'all-traffic',
          protocol: 'all',
          fromPort: 0,
          toPort: 0,
          destinationType: 'anywhere-ipv4',
          destination: '0.0.0.0/0',
        },
      ],
      tags: (securityGroup?.tags as any[]) || [],
    },
  })

  // Setup field arrays
  const {
    fields: inboundRuleFields,
    append: appendInboundRule,
    remove: removeInboundRule,
  } = useFieldArray({
    control: form.control,
    name: 'inboundRules',
  })

  const {
    fields: outboundRuleFields,
    append: appendOutboundRule,
    remove: removeOutboundRule,
  } = useFieldArray({
    control: form.control,
    name: 'outboundRules',
  })

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

  const onSubmit = (values: FormValues) => {
    if (type === 'update' && securityGroup) {
      updateSecurityGroup({
        id: securityGroup.id,
        ...values,
      })
    } else {
      createSecurityGroup(values)
    }
  }

  const watchCloudProvider = form.watch('cloudProvider')

  // Filter cloud provider accounts based on selected provider
  const filteredAccounts = cloudProviderAccounts.filter(
    account => account.type === watchCloudProvider,
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-6'>
        <ScrollArea className='h-[60vh] pl-1 pr-4'>
          <div className='space-y-4'>
            {/* Basic Information */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Security Group Name</FormLabel>
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
                name='cloudProvider'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cloud Provider</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select cloud provider' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='aws'>AWS</SelectItem>
                        <SelectItem value='azure'>Azure</SelectItem>
                        <SelectItem value='gcp'>
                          Google Cloud Platform
                        </SelectItem>
                        <SelectItem value='digitalocean'>
                          Digital Ocean
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        {filteredAccounts?.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator className='my-4' />

          {/* Inbound Rules */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium'>Inbound Rules</h3>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  appendInboundRule({
                    name: '',
                    description: '',
                    type: 'custom-tcp',
                    protocol: 'tcp',
                    fromPort: 0,
                    toPort: 0,
                    sourceType: 'custom',
                    source: '',
                  })
                }>
                <Plus className='mr-2 h-4 w-4' />
                Add Rule
              </Button>
            </div>

            {inboundRuleFields.length === 0 && (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <ShieldAlert className='mb-4 h-12 w-12 text-muted-foreground opacity-20' />
                <p className='text-muted-foreground'>No Inbound Rules Found</p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Add inbound rules to control incoming traffic to your
                  resources
                </p>
              </div>
            )}

            {inboundRuleFields.map((field, index) => {
              const watchRuleType = form.watch(`inboundRules.${index}.type`)
              const watchSourceType = form.watch(
                `inboundRules.${index}.sourceType`,
              )

              return (
                <div key={field.id} className='space-y-4 rounded-md border p-4'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-medium'>Inbound Rule {index + 1}</h4>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => removeInboundRule(index)}
                      className='text-red-500 hover:text-red-600'>
                      <Trash2 className='mr-1 h-4 w-4' />
                      Remove
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name={`inboundRules.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rule Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`inboundRules.${index}.description`}
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
                    name={`inboundRules.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select rule type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='all-traffic'>
                              All Traffic
                            </SelectItem>
                            <SelectItem value='custom-tcp'>
                              Custom TCP
                            </SelectItem>
                            <SelectItem value='custom-udp'>
                              Custom UDP
                            </SelectItem>
                            <SelectItem value='custom-icmp'>
                              Custom ICMP
                            </SelectItem>
                            <SelectItem value='ssh'>SSH</SelectItem>
                            <SelectItem value='https'>HTTPS</SelectItem>
                            <SelectItem value='http'>HTTP</SelectItem>
                            <SelectItem value='rdp'>RDP</SelectItem>
                            <SelectItem value='custom'>Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchRuleType === 'custom' && (
                    <FormField
                      control={form.control}
                      name={`inboundRules.${index}.protocol`}
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
                              <SelectItem value='all'>All</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {([
                    'custom-tcp',
                    'custom-udp',
                    'ssh',
                    'http',
                    'https',
                    'rdp',
                  ].includes(watchRuleType) ||
                    (watchRuleType === 'custom' &&
                      form.watch(`inboundRules.${index}.protocol`) !== 'icmp' &&
                      form.watch(`inboundRules.${index}.protocol`) !==
                        'all')) && (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name={`inboundRules.${index}.fromPort`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Port Range (From)</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min={0}
                                max={65535}
                                {...field}
                                onChange={e =>
                                  field.onChange(
                                    parseInt(e.target.value, 10) || 0,
                                  )
                                }
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`inboundRules.${index}.toPort`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Port Range (To)</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min={0}
                                max={65535}
                                {...field}
                                onChange={e =>
                                  field.onChange(
                                    parseInt(e.target.value, 10) || 0,
                                  )
                                }
                                value={field.value || 0}
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
                    name={`inboundRules.${index}.sourceType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select source type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='my-ip'>My IP</SelectItem>
                            <SelectItem value='anywhere-ipv4'>
                              Anywhere-IPv4
                            </SelectItem>
                            <SelectItem value='anywhere-ipv6'>
                              Anywhere-IPv6
                            </SelectItem>
                            <SelectItem value='custom'>Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`inboundRules.${index}.source`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source</FormLabel>
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
                </div>
              )
            })}
          </div>

          <Separator className='my-4' />

          {/* Outbound Rules */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium'>Outbound Rules</h3>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  appendOutboundRule({
                    name: '',
                    description: '',
                    type: 'all-traffic',
                    protocol: 'all',
                    fromPort: 0,
                    toPort: 0,
                    destinationType: 'anywhere-ipv4',
                    destination: '0.0.0.0/0',
                  })
                }>
                <Plus className='mr-2 h-4 w-4' />
                Add Rule
              </Button>
            </div>

            {outboundRuleFields.length === 0 && (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <ShieldCheck className='mb-4 h-12 w-12 text-muted-foreground opacity-20' />
                <p className='text-muted-foreground'>No Outbound Rules Found</p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Add outbound rules to control traffic leaving your resources
                </p>
              </div>
            )}

            {outboundRuleFields.map((field, index) => {
              const watchRuleType = form.watch(`outboundRules.${index}.type`)
              const watchDestinationType = form.watch(
                `outboundRules.${index}.destinationType`,
              )

              return (
                <div key={field.id} className='space-y-4 rounded-md border p-4'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-medium'>Outbound Rule {index + 1}</h4>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => removeOutboundRule(index)}
                      className='text-red-500 hover:text-red-600'>
                      <Trash2 className='mr-1 h-4 w-4' />
                      Remove
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name={`outboundRules.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rule Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`outboundRules.${index}.description`}
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
                    name={`outboundRules.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select rule type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='all-traffic'>
                              All Traffic
                            </SelectItem>
                            <SelectItem value='custom-tcp'>
                              Custom TCP
                            </SelectItem>
                            <SelectItem value='custom-udp'>
                              Custom UDP
                            </SelectItem>
                            <SelectItem value='custom-icmp'>
                              Custom ICMP
                            </SelectItem>
                            <SelectItem value='ssh'>SSH</SelectItem>
                            <SelectItem value='https'>HTTPS</SelectItem>
                            <SelectItem value='http'>HTTP</SelectItem>
                            <SelectItem value='rdp'>RDP</SelectItem>
                            <SelectItem value='custom'>Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchRuleType === 'custom' && (
                    <FormField
                      control={form.control}
                      name={`outboundRules.${index}.protocol`}
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
                              <SelectItem value='all'>All</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {([
                    'custom-tcp',
                    'custom-udp',
                    'ssh',
                    'http',
                    'https',
                    'rdp',
                  ].includes(watchRuleType) ||
                    (watchRuleType === 'custom' &&
                      form.watch(`outboundRules.${index}.protocol`) !==
                        'icmp' &&
                      form.watch(`outboundRules.${index}.protocol`) !==
                        'all')) && (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name={`outboundRules.${index}.fromPort`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Port Range (From)</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min={0}
                                max={65535}
                                {...field}
                                onChange={e =>
                                  field.onChange(
                                    parseInt(e.target.value, 10) || 0,
                                  )
                                }
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`outboundRules.${index}.toPort`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Port Range (To)</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min={0}
                                max={65535}
                                {...field}
                                onChange={e =>
                                  field.onChange(
                                    parseInt(e.target.value, 10) || 0,
                                  )
                                }
                                value={field.value || 0}
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
                    name={`outboundRules.${index}.destinationType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select destination type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='my-ip'>My IP</SelectItem>
                            <SelectItem value='anywhere-ipv4'>
                              Anywhere-IPv4
                            </SelectItem>
                            <SelectItem value='anywhere-ipv6'>
                              Anywhere-IPv6
                            </SelectItem>
                            <SelectItem value='custom'>Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`outboundRules.${index}.destination`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination</FormLabel>
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
                </div>
              )
            })}
          </div>

          <Separator className='my-4' />

          {/* Tags */}
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
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <Tag className='mb-4 h-12 w-12 text-muted-foreground opacity-20' />
                <p className='text-muted-foreground'>No Tags Found</p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Add tags to organize and manage your resources
                </p>
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
            {type === 'create'
              ? 'Create Security Group'
              : 'Update Security Group'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default SecurityGroupForm
