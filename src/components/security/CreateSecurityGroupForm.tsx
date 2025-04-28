'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2, WandSparkles } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { Dispatch, SetStateAction, useCallback, useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  Config,
  NumberDictionary,
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator'
import { z } from 'zod'

import {
  createSecurityGroupAction,
  updateSecurityGroupAction,
} from '@/actions/securityGroups'
import { createSecurityGroupSchema } from '@/actions/securityGroups/validator'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CloudProviderAccount, SecurityGroup } from '@/payload-types'

import BasicInfoSection from './BasicInfoSection'
import InboundRulesSection from './InboundRulesSection'
import OutboundRulesSection from './OutboundRulesSection'
import TagsSection from './TagsSection'

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

type Protocol = 'all' | 'tcp' | 'udp' | 'icmp' | 'icmpv6' | string

// Define the extended schema for the form
const extendedSecurityGroupSchema = createSecurityGroupSchema.extend({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  cloudProvider: z.enum(['aws', 'azure', 'gcp', 'digitalocean']).optional(),
  cloudProviderAccount: z.string().optional(),
  inboundRules: z
    .array(
      z.object({
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
        sourceType: z.enum([
          'my-ip',
          'anywhere-ipv4',
          'anywhere-ipv6',
          'custom',
        ]),
        source: z.string(),
        securityGroupRuleId: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  outboundRules: z
    .array(
      z.object({
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
      }),
    )
    .optional()
    .default([]),
  tags: z
    .array(
      z.object({
        key: z.string().min(1, 'Key is required'),
        value: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
})

type FormValues = z.infer<typeof extendedSecurityGroupSchema>

const handleGenerateName = (): string => {
  const numberDictionary = NumberDictionary.generate({ min: 100, max: 999 })

  const nameConfig: Config = {
    dictionaries: [['dFlow'], adjectives, animals, numberDictionary],
    separator: '-',
    length: 4,
    style: 'lowerCase',
  }

  return uniqueNamesGenerator(nameConfig)
}

export const mapRuleTypeToValues = (
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

export const mapSourceTypeToValue = (sourceType: string): string => {
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

const CreateSecurityGroupForm = ({
  type = 'create',
  securityGroup,
  open,
  setOpen,
  cloudProviderAccounts = [],
  isFullScreen = false,
}: {
  type?: 'create' | 'update'
  securityGroup?: Partial<SecurityGroup>
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  cloudProviderAccounts: CloudProviderAccount[]
  isFullScreen?: boolean
}) => {
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
        typeof securityGroup?.cloudProviderAccount === 'object'
          ? securityGroup?.cloudProviderAccount?.id
          : securityGroup?.cloudProviderAccount || '',
      inboundRules: initialInboundRules,
      outboundRules: initialOutboundRules,
      tags: (securityGroup?.tags as any[]) || [],
    },
  })

  const generateCommonRules = () => {
    const awsAccount = cloudProviderAccounts.find(
      account => account.type === 'aws',
    )

    const commonData: Partial<SecurityGroup> = {
      name: handleGenerateName(),
      description: 'Security group with common rules',
      cloudProvider: 'aws',
      cloudProviderAccount: awsAccount?.id || '',
      inboundRules: [
        {
          description: 'SSH access',
          type: 'ssh',
          protocol: 'tcp',
          fromPort: 22,
          toPort: 22,
          sourceType: 'anywhere-ipv4',
          source: '0.0.0.0/0',
        },
        {
          description: 'HTTP access',
          type: 'http',
          protocol: 'tcp',
          fromPort: 80,
          toPort: 80,
          sourceType: 'anywhere-ipv4',
          source: '0.0.0.0/0',
        },
        {
          description: 'HTTPS access',
          type: 'https',
          protocol: 'tcp',
          fromPort: 443,
          toPort: 443,
          sourceType: 'anywhere-ipv4',
          source: '0.0.0.0/0',
        },
        {
          description: 'Monitoring tools port',
          type: 'custom-tcp',
          protocol: 'tcp',
          fromPort: 19999,
          toPort: 19999,
          sourceType: 'anywhere-ipv4',
          source: '0.0.0.0/0',
        },
        {
          description: 'Custom application port',
          type: 'custom-tcp',
          protocol: 'tcp',
          fromPort: 3000,
          toPort: 3000,
          sourceType: 'anywhere-ipv4',
          source: '0.0.0.0/0',
        },
      ],
      outboundRules: [
        {
          description: 'Allow all outbound traffic',
          type: 'all-traffic',
          protocol: 'all',
          destinationType: 'anywhere-ipv4',
          destination: '0.0.0.0/0',
        },
      ],
      tags: [
        { key: 'Name', value: 'MySecurityGroup' },
        { key: 'Environment', value: 'Production' },
      ],
    }

    form.setValue('name', commonData.name as any)
    form.setValue('description', commonData.description as any)
    form.setValue('cloudProvider', commonData.cloudProvider as any)
    form.setValue('inboundRules', commonData.inboundRules as any)
    form.setValue('outboundRules', commonData.outboundRules as any)
    form.setValue('tags', commonData.tags as any)
  }

  const {
    fields: inboundRuleFields,
    prepend: appendInboundRule,
    remove: removeInboundRule,
  } = useFieldArray({
    control: form.control,
    name: 'inboundRules',
  })

  const {
    fields: outboundRuleFields,
    prepend: appendOutboundRule,
    remove: removeOutboundRule,
  } = useFieldArray({
    control: form.control,
    name: 'outboundRules',
  })

  const {
    fields: tagFields,
    prepend: appendTag,
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
  const filteredAccounts = cloudProviderAccounts.filter(
    account => account.type === watchCloudProvider,
  )

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
    <>
      <div className='flex items-center justify-between'>
        {type === 'create' && (
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='secondary'
              onClick={generateCommonRules}
              className='gap-2'>
              <WandSparkles className='h-4 w-4' />
              Generate Rules
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => form.reset()}
              className='gap-2'>
              <Trash2 className='h-4 w-4' />
              Clear Form
            </Button>
          </div>
        )}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-6'>
          <ScrollArea
            className={`${isFullScreen ? 'h-[calc(100vh-220px)]' : 'h-[60vh]'} pl-1 pr-4 pt-4`}>
            <div className='space-y-4'>
              <BasicInfoSection
                form={form}
                filteredAccounts={filteredAccounts}
              />

              <Separator className='my-4' />

              <InboundRulesSection
                form={form}
                fields={inboundRuleFields}
                onAppend={() =>
                  appendInboundRule({
                    description: '',
                    type: 'custom-tcp',
                    protocol: 'tcp',
                    fromPort: 0,
                    toPort: 0,
                    sourceType: 'custom',
                    source: '',
                  })
                }
                onRemove={removeInboundRule}
                handleTypeChange={handleTypeChange}
                handleSourceTypeChange={handleSourceTypeChange}
              />

              <Separator className='my-4' />

              <OutboundRulesSection
                form={form}
                fields={outboundRuleFields}
                onAppend={() =>
                  appendOutboundRule({
                    description: '',
                    type: 'all-traffic',
                    protocol: 'all',
                    destinationType: 'anywhere-ipv4',
                    destination: '0.0.0.0/0',
                  })
                }
                onRemove={removeOutboundRule}
                handleTypeChange={handleTypeChange}
                handleSourceTypeChange={handleSourceTypeChange}
              />

              <Separator className='my-4' />

              <TagsSection
                form={form}
                fields={tagFields}
                onAppend={() => appendTag({ key: '', value: '' })}
                onRemove={removeTag}
              />
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              type='submit'
              onClick={e => {
                e.preventDefault()
                form.handleSubmit(onSubmit)()
              }}
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
    </>
  )
}

export default CreateSecurityGroupForm
