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
import { Dispatch, SetStateAction, useCallback, useEffect } from 'react'
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

// Define RuleType union
type RuleType =
  | 'all-traffic'
  | 'all-tcp'
  | 'all-udp'
  | 'ssh'
  | 'http'
  | 'https'
  | 'custom-tcp'
  | 'custom-udp'
  | 'icmp'
  | 'icmpv6'
  | 'smtp'
  | 'pop3'
  | 'imap'
  | 'ms-sql'
  | 'mysql-aurora'
  | 'postgresql'
  | 'dns-udp'
  | 'rdp'
  | 'nfs'
  | 'custom-protocol'

// Define a type for the form field paths
type FormFieldPath =
  | 'name'
  | 'description'
  | 'cloudProvider'
  | 'cloudProviderAccount'
  | 'inboundRules'
  | 'outboundRules'
  | 'tags'
  | `inboundRules.${number}.description`
  | `inboundRules.${number}.type`
  | `inboundRules.${number}.protocol`
  | `inboundRules.${number}.fromPort`
  | `inboundRules.${number}.toPort`
  | `inboundRules.${number}.sourceType`
  | `inboundRules.${number}.source`
  | `inboundRules.${number}.securityGroupRuleId`
  | `outboundRules.${number}.description`
  | `outboundRules.${number}.type`
  | `outboundRules.${number}.protocol`
  | `outboundRules.${number}.fromPort`
  | `outboundRules.${number}.toPort`
  | `outboundRules.${number}.destinationType`
  | `outboundRules.${number}.destination`
  | `outboundRules.${number}.securityGroupRuleId`
  | `tags.${number}.key`
  | `tags.${number}.value`

type Protocol = 'all' | 'tcp' | 'udp' | 'icmp' | 'icmpv6' | string

// Helper function to map rule type to protocol and ports
const mapRuleTypeToValues = (
  type: RuleType,
): { protocol: Protocol; fromPort?: number; toPort?: number } => {
  switch (type) {
    case 'all-traffic':
      return { protocol: 'all' }
    case 'all-tcp':
      return { protocol: 'tcp', fromPort: 0, toPort: 65535 }
    case 'all-udp':
      return { protocol: 'udp', fromPort: 0, toPort: 65535 }
    case 'ssh':
      return { protocol: 'tcp', fromPort: 22, toPort: 22 }
    case 'http':
      return { protocol: 'tcp', fromPort: 80, toPort: 80 }
    case 'https':
      return { protocol: 'tcp', fromPort: 443, toPort: 443 }
    case 'custom-tcp':
      return { protocol: 'tcp', fromPort: 0, toPort: 0 }
    case 'custom-udp':
      return { protocol: 'udp', fromPort: 0, toPort: 0 }
    case 'icmp':
      return { protocol: 'icmp' }
    case 'icmpv6':
      return { protocol: 'icmpv6' }
    case 'smtp':
      return { protocol: 'tcp', fromPort: 25, toPort: 25 }
    case 'pop3':
      return { protocol: 'tcp', fromPort: 110, toPort: 110 }
    case 'imap':
      return { protocol: 'tcp', fromPort: 143, toPort: 143 }
    case 'ms-sql':
      return { protocol: 'tcp', fromPort: 1433, toPort: 1433 }
    case 'mysql-aurora':
      return { protocol: 'tcp', fromPort: 3306, toPort: 3306 }
    case 'postgresql':
      return { protocol: 'tcp', fromPort: 5432, toPort: 5432 }
    case 'dns-udp':
      return { protocol: 'udp', fromPort: 53, toPort: 53 }
    case 'rdp':
      return { protocol: 'tcp', fromPort: 3389, toPort: 3389 }
    case 'nfs':
      return { protocol: 'tcp', fromPort: 2049, toPort: 2049 }
    case 'custom-protocol':
      return { protocol: '', fromPort: 0, toPort: 0 }
    default:
      return { protocol: 'tcp', fromPort: 0, toPort: 0 }
  }
}

// Helper function to map sourceType/destinationType to source/destination
const mapSourceTypeToValue = (sourceType: string): string => {
  switch (sourceType) {
    case 'my-ip':
      return 'YOUR_IP/32'
    case 'anywhere-ipv4':
      return '0.0.0.0/0'
    case 'anywhere-ipv6':
      return '::/0'
    case 'custom':
      return ''
    default:
      return ''
  }
}

// Inbound rule schema
const inboundRuleSchema = z
  .object({
    description: z.string().optional(),
    type: z.enum([
      'all-traffic',
      'all-tcp',
      'all-udp',
      'ssh',
      'http',
      'https',
      'custom-tcp',
      'custom-udp',
      'icmp',
      'icmpv6',
      'smtp',
      'pop3',
      'imap',
      'ms-sql',
      'mysql-aurora',
      'postgresql',
      'dns-udp',
      'rdp',
      'nfs',
      'custom-protocol',
    ]),
    protocol: z.string().optional(),
    fromPort: z.number().min(-1).max(65535).optional(),
    toPort: z.number().min(-1).max(65535).optional(),
    sourceType: z.enum(['my-ip', 'anywhere-ipv4', 'anywhere-ipv6', 'custom']),
    source: z.string(),
    securityGroupRuleId: z.string().optional(),
  })
  .refine(
    data => {
      if (['custom-tcp', 'custom-udp', 'custom-protocol'].includes(data.type)) {
        return data.fromPort !== undefined && data.toPort !== undefined
      }
      return true
    },
    { message: 'Port range is required for custom rules', path: ['fromPort'] },
  )

// Outbound rule schema
const outboundRuleSchema = z
  .object({
    description: z.string().optional(),
    type: z.enum([
      'all-traffic',
      'all-tcp',
      'all-udp',
      'ssh',
      'http',
      'https',
      'custom-tcp',
      'custom-udp',
      'icmp',
      'icmpv6',
      'smtp',
      'pop3',
      'imap',
      'ms-sql',
      'mysql-aurora',
      'postgresql',
      'dns-udp',
      'rdp',
      'nfs',
      'custom-protocol',
    ]),
    protocol: z.string().optional(),
    fromPort: z.number().min(-1).max(65535).optional(),
    toPort: z.number().min(-1).max(65535).optional(),
    destinationType: z.enum([
      'my-ip',
      'anywhere-ipv4',
      'anywhere-ipv6',
      'custom',
    ]),
    destination: z.string(),
    securityGroupRuleId: z.string().optional(),
  })
  .refine(
    data => {
      if (['custom-tcp', 'custom-udp', 'custom-protocol'].includes(data.type)) {
        return data.fromPort !== undefined && data.toPort !== undefined
      }
      return true
    },
    { message: 'Port range is required for custom rules', path: ['fromPort'] },
  )

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
  securityGroup?: Partial<SecurityGroup>
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  cloudProviderAccounts: CloudProviderAccount[]
}) => {
  // Transform inbound rules
  const initialInboundRules = securityGroup?.inboundRules?.map(rule => ({
    description: rule.description || '',
    type: rule.type,
    protocol: rule.protocol || 'tcp',
    fromPort: rule.fromPort !== null ? rule.fromPort : undefined,
    toPort: rule.toPort !== null ? rule.toPort : undefined,
    sourceType: rule.sourceType,
    source: rule.source,
    securityGroupRuleId: rule.securityGroupRuleId || undefined,
  })) || [
    {
      description: '',
      type: 'custom-tcp' as RuleType,
      protocol: 'tcp',
      fromPort: 0,
      toPort: 0,
      sourceType: 'custom',
      source: '',
    },
  ]

  // Transform outbound rules
  const initialOutboundRules = securityGroup?.outboundRules?.map(rule => ({
    description: rule.description || '',
    type: rule.type,
    protocol: rule.protocol || 'all',
    fromPort: rule.fromPort !== null ? rule.fromPort : undefined,
    toPort: rule.toPort !== null ? rule.toPort : undefined,
    destinationType: rule.destinationType,
    destination: rule.destination,
    securityGroupRuleId: rule.securityGroupRuleId || undefined,
  })) || [
    {
      description: '',
      type: 'all-traffic' as RuleType,
      protocol: 'all',
      destinationType: 'anywhere-ipv4',
      destination: '0.0.0.0/0',
    },
  ]

  const form = useForm<FormValues>({
    resolver: zodResolver(extendedSecurityGroupSchema),
    defaultValues: {
      name: securityGroup?.name || '',
      description: securityGroup?.description || '',
      cloudProvider: (securityGroup?.cloudProvider as any) || 'aws',
      cloudProviderAccount:
        ((securityGroup?.cloudProviderAccount as CloudProviderAccount)
          ?.id as string) || '',
      inboundRules: initialInboundRules,
      outboundRules: initialOutboundRules,
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

  const handleTypeChange = useCallback(
    (value: RuleType, index: number, isInbound: boolean) => {
      const { protocol, fromPort, toPort } = mapRuleTypeToValues(value)

      if (isInbound) {
        const protocolPath: `inboundRules.${number}.protocol` = `inboundRules.${index}.protocol`
        const fromPortPath: `inboundRules.${number}.fromPort` = `inboundRules.${index}.fromPort`
        const toPortPath: `inboundRules.${number}.toPort` = `inboundRules.${index}.toPort`

        form.setValue(protocolPath, protocol)
        form.setValue(fromPortPath, fromPort)
        form.setValue(toPortPath, toPort)
      } else {
        const protocolPath: `outboundRules.${number}.protocol` = `outboundRules.${index}.protocol`
        const fromPortPath: `outboundRules.${number}.fromPort` = `outboundRules.${index}.fromPort`
        const toPortPath: `outboundRules.${number}.toPort` = `outboundRules.${index}.toPort`

        form.setValue(protocolPath, protocol)
        form.setValue(fromPortPath, fromPort)
        form.setValue(toPortPath, toPort)
      }
    },
    [form],
  )

  const handleSourceTypeChange = useCallback(
    (value: string, index: number, isInbound: boolean) => {
      const sourceValue = mapSourceTypeToValue(value)

      if (isInbound) {
        const sourcePath: `inboundRules.${number}.source` = `inboundRules.${index}.source`
        form.setValue(sourcePath, sourceValue)
      } else {
        const destinationPath: `outboundRules.${number}.destination` = `outboundRules.${index}.destination`
        form.setValue(destinationPath, sourceValue)
      }
    },
    [form],
  )

  // Watch inbound rule types and source types
  useEffect(() => {
    const subscriptions = inboundRuleFields.map((_, index) => {
      const ruleTypeSubscription = form.watch((value, { name }) => {
        if (name === `inboundRules.${index}.type`) {
          handleTypeChange(
            value.inboundRules?.[index]?.type as RuleType,
            index,
            true,
          )
        }
      })

      const sourceTypeSubscription = form.watch((value, { name }) => {
        if (name === `inboundRules.${index}.sourceType`) {
          handleSourceTypeChange(
            value.inboundRules?.[index]?.sourceType as string,
            index,
            true,
          )
        }
      })

      return () => {
        ruleTypeSubscription.unsubscribe()
        sourceTypeSubscription.unsubscribe()
      }
    })

    return () => {
      subscriptions.forEach(unsub => unsub && unsub())
    }
  }, [inboundRuleFields.length, form, handleTypeChange, handleSourceTypeChange])

  // Watch outbound rule types and destination types
  useEffect(() => {
    const subscriptions = outboundRuleFields.map((_, index) => {
      const ruleTypeSubscription = form.watch((value, { name }) => {
        if (name === `outboundRules.${index}.type`) {
          handleTypeChange(
            value.outboundRules?.[index]?.type as RuleType,
            index,
            false,
          )
        }
      })

      const destinationTypeSubscription = form.watch((value, { name }) => {
        if (name === `outboundRules.${index}.destinationType`) {
          handleSourceTypeChange(
            value.outboundRules?.[index]?.destinationType as string,
            index,
            false,
          )
        }
      })

      return () => {
        ruleTypeSubscription.unsubscribe()
        destinationTypeSubscription.unsubscribe()
      }
    })

    return () => {
      subscriptions.forEach(unsub => unsub && unsub())
    }
  }, [
    outboundRuleFields.length,
    form,
    handleTypeChange,
    handleSourceTypeChange,
  ])

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

  const watchCloudProvider = form.watch('cloudProvider')

  // Filter cloud provider accounts based on selected provider
  const filteredAccounts = cloudProviderAccounts.filter(
    account => account.type === watchCloudProvider,
  )

  // Transform values during submission to ensure protocol and ports are set
  const onSubmit = (values: FormValues) => {
    const transformedValues = {
      ...values,
      inboundRules: values.inboundRules?.map(rule => {
        const { protocol, fromPort, toPort } = mapRuleTypeToValues(rule.type)
        return {
          ...rule,
          protocol: rule.protocol || protocol,
          fromPort: rule.fromPort !== undefined ? rule.fromPort : -1,
          toPort: rule.toPort !== undefined ? rule.toPort : -1,
          securityGroupRuleId: rule.securityGroupRuleId,
        }
      }),
      outboundRules: values.outboundRules?.map(rule => {
        const { protocol, fromPort, toPort } = mapRuleTypeToValues(rule.type)
        return {
          ...rule,
          protocol: rule.protocol || protocol,
          fromPort: rule.fromPort !== undefined ? rule.fromPort : -1,
          toPort: rule.toPort !== undefined ? rule.toPort : -1,
          securityGroupRuleId: rule.securityGroupRuleId,
        }
      }),
    }

    if (type === 'update' && securityGroup) {
      updateSecurityGroup({
        id: securityGroup?.id as string,
        ...transformedValues,
      })
    } else {
      createSecurityGroup(transformedValues)
    }
  }

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
                        {filteredAccounts.map(account => (
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
                  <p className='text-muted-foreground'>
                    No Inbound Rules Found
                  </p>
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
                const isCustomType = [
                  'custom-tcp',
                  'custom-udp',
                  'custom-protocol',
                ].includes(watchRuleType)
                const isPortEditable = isCustomType
                const isProtocolEditable = watchRuleType === 'custom-protocol'
                const hidePorts = ['all-traffic', 'icmp', 'icmpv6'].includes(
                  watchRuleType,
                )
                const isCustomSource = watchSourceType === 'custom'

                return (
                  <div
                    key={field.id}
                    className='space-y-4 rounded-md border p-4'>
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

                    {/* Hidden field for securityGroupRuleId */}
                    <input
                      type='hidden'
                      {...form.register(
                        `inboundRules.${index}.securityGroupRuleId`,
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`inboundRules.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select
                            onValueChange={value => {
                              field.onChange(value)
                              handleTypeChange(value as RuleType, index, true)
                            }}
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
                              <SelectItem value='all-tcp'>All TCP</SelectItem>
                              <SelectItem value='all-udp'>All UDP</SelectItem>
                              <SelectItem value='ssh'>SSH</SelectItem>
                              <SelectItem value='http'>HTTP</SelectItem>
                              <SelectItem value='https'>HTTPS</SelectItem>
                              <SelectItem value='custom-tcp'>
                                Custom TCP
                              </SelectItem>
                              <SelectItem value='custom-udp'>
                                Custom UDP
                              </SelectItem>
                              <SelectItem value='icmp'>ICMP</SelectItem>
                              <SelectItem value='icmpv6'>ICMPv6</SelectItem>
                              <SelectItem value='smtp'>SMTP</SelectItem>
                              <SelectItem value='pop3'>POP3</SelectItem>
                              <SelectItem value='imap'>IMAP</SelectItem>
                              <SelectItem value='ms-sql'>MS SQL</SelectItem>
                              <SelectItem value='mysql-aurora'>
                                MySQL/Aurora
                              </SelectItem>
                              <SelectItem value='postgresql'>
                                PostgreSQL
                              </SelectItem>
                              <SelectItem value='dns-udp'>DNS (UDP)</SelectItem>
                              <SelectItem value='rdp'>RDP</SelectItem>
                              <SelectItem value='nfs'>NFS</SelectItem>
                              <SelectItem value='custom-protocol'>
                                Custom Protocol
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`inboundRules.${index}.protocol`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Protocol</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isProtocolEditable}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!hidePorts && (
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
                                  min={-1}
                                  max={65535}
                                  {...field}
                                  disabled={!isPortEditable}
                                  onChange={e =>
                                    field.onChange(
                                      parseInt(e.target.value, 10) || 0,
                                    )
                                  }
                                  value={field.value ?? ''}
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
                                  min={-1}
                                  max={65535}
                                  {...field}
                                  disabled={!isPortEditable}
                                  onChange={e =>
                                    field.onChange(
                                      parseInt(e.target.value, 10) || 0,
                                    )
                                  }
                                  value={field.value ?? ''}
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
                            onValueChange={value => {
                              field.onChange(value)
                              handleSourceTypeChange(value, index, true)
                            }}
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
                            <Input
                              {...field}
                              placeholder='0.0.0.0/0'
                              disabled={!isCustomSource}
                            />
                          </FormControl>
                          <FormDescription>
                            CIDR notation (e.g., 0.0.0.0/0 for anywhere)
                          </FormDescription>
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
                      description: '',
                      type: 'all-traffic',
                      protocol: 'all',
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
                  <p className='text-muted-foreground'>
                    No Outbound Rules Found
                  </p>
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
                const isCustomType = [
                  'custom-tcp',
                  'custom-udp',
                  'custom-protocol',
                ].includes(watchRuleType)
                const isPortEditable = isCustomType
                const isProtocolEditable = watchRuleType === 'custom-protocol'
                const hidePorts = ['all-traffic', 'icmp', 'icmpv6'].includes(
                  watchRuleType,
                )
                const isCustomDestination = watchDestinationType === 'custom'

                return (
                  <div
                    key={field.id}
                    className='space-y-4 rounded-md border p-4'>
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
                      name={`outboundRules.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select
                            onValueChange={value => {
                              field.onChange(value)
                              handleTypeChange(value as RuleType, index, false)
                            }}
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
                              <SelectItem value='all-tcp'>All TCP</SelectItem>
                              <SelectItem value='all-udp'>All UDP</SelectItem>
                              <SelectItem value='ssh'>SSH</SelectItem>
                              <SelectItem value='http'>HTTP</SelectItem>
                              <SelectItem value='https'>HTTPS</SelectItem>
                              <SelectItem value='custom-tcp'>
                                Custom TCP
                              </SelectItem>
                              <SelectItem value='custom-udp'>
                                Custom UDP
                              </SelectItem>
                              <SelectItem value='icmp'>ICMP</SelectItem>
                              <SelectItem value='icmpv6'>ICMPv6</SelectItem>
                              <SelectItem value='smtp'>SMTP</SelectItem>
                              <SelectItem value='pop3'>POP3</SelectItem>
                              <SelectItem value='imap'>IMAP</SelectItem>
                              <SelectItem value='ms-sql'>MS SQL</SelectItem>
                              <SelectItem value='mysql-aurora'>
                                MySQL/Aurora
                              </SelectItem>
                              <SelectItem value='postgresql'>
                                PostgreSQL
                              </SelectItem>
                              <SelectItem value='dns-udp'>DNS (UDP)</SelectItem>
                              <SelectItem value='rdp'>RDP</SelectItem>
                              <SelectItem value='nfs'>NFS</SelectItem>
                              <SelectItem value='custom-protocol'>
                                Custom Protocol
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`outboundRules.${index}.protocol`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Protocol</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isProtocolEditable}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!hidePorts && (
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
                                  min={-1}
                                  max={65535}
                                  {...field}
                                  disabled={!isPortEditable}
                                  onChange={e =>
                                    field.onChange(
                                      parseInt(e.target.value, 10) || 0,
                                    )
                                  }
                                  value={field.value ?? ''}
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
                                  min={-1}
                                  max={65535}
                                  {...field}
                                  disabled={!isPortEditable}
                                  onChange={e =>
                                    field.onChange(
                                      parseInt(e.target.value, 10) || 0,
                                    )
                                  }
                                  value={field.value ?? ''}
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
                            onValueChange={value => {
                              field.onChange(value)
                              handleSourceTypeChange(value, index, false)
                            }}
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
                            <Input
                              {...field}
                              placeholder='0.0.0.0/0'
                              disabled={!isCustomDestination}
                            />
                          </FormControl>
                          <FormDescription>
                            CIDR notation (e.g., 0.0.0.0/0 for anywhere)
                          </FormDescription>
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
                  </div>
                )
              })}
            </div>

            <Separator className='my-4' />

            {/* Tags */}
            <div className='space-y-4'>
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
                    Add tags to help organize and identify your security groups
                  </p>
                </div>
              )}

              {tagFields.map((field, index) => (
                <div key={field.id} className='rounded-md border p-4'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-medium'>Tag {index + 1}</h4>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => removeTag(index)}
                      className='text-red-500 hover:text-red-600'>
                      <Trash2 className='mr-1 h-4 w-4' />
                      Remove
                    </Button>
                  </div>

                  <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name={`tags.${index}.key`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='Name' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`tags.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='MySecurityGroup' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            type='submit'
            disabled={isCreatingSecurityGroup || isUpdatingSecurityGroup}>
            {isCreatingSecurityGroup || isUpdatingSecurityGroup ? (
              <>Saving...</>
            ) : type === 'update' ? (
              'Update Security Group'
            ) : (
              'Create Security Group'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default SecurityGroupForm
