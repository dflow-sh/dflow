'use client'

import type { VpsPlan } from '../../actions/cloud/dFlow/types'
import { ComingSoonBadge } from '../ComingSoonBadge'
import SidebarToggleButton from '../SidebarToggleButton'
import { ArrowRight, ChevronLeft, Cloud, Server } from 'lucide-react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { parseAsString, useQueryState } from 'nuqs'
import React, { useEffect, useId, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cloudProvidersList } from '@/lib/integrationList'
import { SecurityGroup, SshKey } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

import AttachCustomServerForm from './AttachCustomServerForm'
import { ConnectDFlowCloudButton } from './ConnectDFlowCloudButton'
import CreateEC2InstanceForm from './CreateEC2InstanceForm'
import VpsForm from './VpsForm'

interface ServerSelectionFormProps {
  setType: (type: string) => void
  type: string
  setOption: (plan: string) => void
  option: string
  isOnboarding: boolean
  vpsPlans: VpsPlan[]
  dFlowAccountDetails?: {
    accessToken: string
  }
}

interface ServerFormContentProps {
  type: string
  sshKeys: SshKey[]
  securityGroups?: SecurityGroup[]
  server?: ServerType
  formType?: 'create' | 'update'
  onBack: () => void
  isOnboarding: boolean
  vpsPlan?: VpsPlan
}

interface ServerFormProps {
  sshKeys: SshKey[]
  securityGroups?: SecurityGroup[]
  server?: ServerType
  formType?: 'create' | 'update'
  vpsPlans?: VpsPlan[]
  dFlowAccountDetails?: {
    accessToken: string
  }
}

const ServerSelectionForm: React.FC<ServerSelectionFormProps> = ({
  setType,
  setOption,
  option,
  type,
  isOnboarding,
  vpsPlans,
  dFlowAccountDetails,
}) => {
  const id = useId()
  const [selectedType, setSelectedType] = useState<string>('manual')
  const [selectedOption, setSelectedOption] = useState<string>('manual')

  const handleContinue = () => {
    setType(selectedType)
    setOption(selectedOption)
  }

  const formatSpecs = (plan: any) => {
    return `${plan.cpu.cores}C ${plan.cpu.type} • ${plan.ram.size}${plan.ram.unit} RAM • ${plan.storageOptions?.[0]?.size}${plan.storageOptions?.[0]?.unit} ${plan.storageOptions?.[0]?.type}`
  }

  // Helper function to format pricing
  const formatPrice = (plan: any) => {
    return plan.pricing?.[0] ? `$${plan.pricing[0].price.toFixed(2)}/month` : ''
  }

  return (
    <div className='space-y-8'>
      {!isOnboarding && (
        <div>
          <h2 className='text-2xl font-semibold'>Choose a Deployment Option</h2>
          <p className='mt-1 text-muted-foreground'>
            Select a cloud provider or add server details manually
          </p>
        </div>
      )}

      <div className='space-y-6'>
        {/* dFlow Cloud Section */}
        <Card className='border shadow-sm'>
          <CardHeader className='pb-0'>
            <CardTitle className='text-lg font-medium'>dFlow Cloud</CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            {!dFlowAccountDetails?.accessToken ? (
              <div className='flex justify-center'>
                <ConnectDFlowCloudButton />
              </div>
            ) : (
              <RadioGroup
                className='grid grid-cols-1 gap-6 md:grid-cols-2'
                value={selectedOption}
                onValueChange={(value: string) => {
                  setSelectedType('dFlow')
                  setSelectedOption(value)
                }}>
                {vpsPlans
                  ?.filter(plan => plan.slug === 'cloud-vps-10')
                  ?.map(plan => (
                    <div
                      key={plan.slug}
                      className={`relative flex w-full items-start rounded-md border ${
                        selectedOption === plan.slug
                          ? 'border-2 border-primary'
                          : 'border-input'
                      } cursor-pointer p-4 transition-all duration-200 hover:border-primary/50`}>
                      <RadioGroupItem
                        value={String(plan.slug)}
                        id={`${id}-${plan.slug}`}
                        className='order-1 after:absolute after:inset-0'
                      />
                      <div className='flex grow items-center gap-4'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary'>
                          <Cloud className='h-5 w-5' />
                        </div>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <Label
                              htmlFor={`${id}-${plan.slug}`}
                              className='cursor-pointer font-medium'>
                              {plan.name}
                            </Label>
                            {plan.slug === 'cloud-vps-10' && (
                              <Badge variant='success' className='text-xs'>
                                Free
                              </Badge>
                            )}
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {formatSpecs(plan)}
                          </p>
                          <p
                            className={`text-sm font-medium text-primary ${plan.slug === 'cloud-vps-10' ? 'line-through' : ''}`}>
                            {formatPrice(plan)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Cloud Providers Section */}
        <Card className='border shadow-sm'>
          <CardHeader className='pb-0'>
            <CardTitle className='flex items-center text-lg font-medium'>
              Cloud Providers
              <SidebarToggleButton directory='servers' fileName='add-server' />
            </CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <RadioGroup
              className='grid grid-cols-1 gap-6 md:grid-cols-2'
              value={selectedOption}
              onValueChange={(value: string) => {
                setSelectedType('cloud')
                setSelectedOption(value)
              }}>
              {cloudProvidersList.map(provider => {
                const { label, Icon, live, slug } = provider

                return (
                  <ComingSoonBadge
                    position='top-right'
                    hideBadge={live}
                    key={slug}>
                    <div
                      className={`relative flex w-full items-start rounded-md border ${
                        selectedOption === slug
                          ? 'border-2 border-primary'
                          : 'border-input'
                      } p-4 transition-all duration-200 ${
                        !live
                          ? 'cursor-not-allowed opacity-60'
                          : 'cursor-pointer hover:border-primary/50'
                      }`}>
                      <RadioGroupItem
                        value={slug}
                        id={`${id}-${slug}`}
                        disabled={!live}
                        className='order-1 after:absolute after:inset-0'
                      />
                      <div className='flex grow items-center gap-4'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary'>
                          {Icon && <Icon className='h-5 w-5' />}
                        </div>
                        <div>
                          <Label
                            htmlFor={`${id}-${slug}`}
                            className='cursor-pointer font-medium'>
                            {label}
                          </Label>
                        </div>
                      </div>
                    </div>
                  </ComingSoonBadge>
                )
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Manual Configuration Section */}
        <Card className='border shadow-sm'>
          <CardHeader className='pb-0'>
            <CardTitle className='flex items-center text-lg font-medium'>
              Manual Configuration
              <SidebarToggleButton
                directory='servers'
                fileName='attach-server'
              />
            </CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <RadioGroup
              className='grid grid-cols-1'
              value={selectedOption}
              onValueChange={(value: string) => {
                setSelectedType('manual')
                setSelectedOption(value)
              }}>
              <div
                className={`relative flex w-full items-start rounded-md border ${
                  selectedOption === 'manual'
                    ? 'border-2 border-primary'
                    : 'border-input'
                } cursor-pointer p-4 transition-all duration-200 hover:border-primary/50`}>
                <RadioGroupItem
                  value='manual'
                  id={`${id}-manual`}
                  className='order-1 after:absolute after:inset-0'
                />
                <div className='flex grow items-center gap-4'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary'>
                    <Server className='h-5 w-5' />
                  </div>
                  <div>
                    <Label
                      htmlFor={`${id}-manual`}
                      className='cursor-pointer font-medium'>
                      Manual Setup
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Bring your own server details
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Button
          className='w-full'
          size='lg'
          disabled={!selectedOption}
          onClick={handleContinue}>
          {selectedType === 'manual'
            ? 'Continue with Manual Setup'
            : selectedType === 'dFlow'
              ? `Continue with ${vpsPlans.find(p => p.slug === selectedOption)?.name}`
              : `Continue with ${cloudProvidersList.find(p => p.slug === selectedOption)?.label || 'Selected Provider'}`}
          <ArrowRight className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}

const ServerFormContent: React.FC<ServerFormContentProps> = ({
  type,
  sshKeys,
  securityGroups,
  server,
  formType,
  onBack,
  isOnboarding,
  vpsPlan,
}) => {
  const router = useRouter()

  const { organisation } = useParams()

  if (!type) return null

  let providerName = ''

  if (type === 'manual') {
    providerName = 'Manual Server Configuration'
  } else if (type === 'dFlow') {
    providerName = `Configure ContentQL Cloud Server`
  } else {
    providerName = `Configure ${cloudProvidersList.find(p => p.slug === type)?.label} Server`
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='icon'
          onClick={onBack}
          className='h-8 w-8'>
          <ChevronLeft className='h-5 w-5' />
        </Button>
        <h2 className='text-xl font-semibold'>{providerName}</h2>
      </div>

      <Card className='border shadow-sm'>
        <CardContent className='p-6'>
          {type === 'aws' ? (
            <CreateEC2InstanceForm
              sshKeys={sshKeys}
              securityGroups={securityGroups}
              formType={formType}
              onSuccess={data => {
                if (isOnboarding) {
                  router.push('/onboarding/dokku-install')
                } else {
                  router.push(`/${organisation}/servers/${data?.server.id}`)
                }
              }}
            />
          ) : type === 'dFlow' ? (
            <VpsForm vpsPlan={vpsPlan as VpsPlan} />
          ) : (
            <AttachCustomServerForm
              sshKeys={sshKeys}
              server={server}
              formType={formType}
              onSuccess={data => {
                if (isOnboarding) {
                  router.push('/onboarding/dokku-install')
                } else {
                  router.push(`/${organisation}/servers/${data?.server.id}`)
                }
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const ServerForm: React.FC<ServerFormProps> = ({
  sshKeys,
  securityGroups,
  server,
  formType,
  dFlowAccountDetails,
  vpsPlans,
}) => {
  const [type, setType] = useQueryState('type', parseAsString.withDefault(''))
  const [option, setOption] = useQueryState(
    'option',
    parseAsString.withDefault(''),
  )

  const pathName = usePathname()
  const isOnboarding = pathName.includes('onboarding')

  useEffect(() => {
    return () => {
      setType('')
      setOption('')
    }
  }, [])

  const handleResetType = () => {
    setType('')
    setOption('')
  }

  return (
    <div className='mx-auto w-full'>
      {!type ? (
        <ServerSelectionForm
          setType={setType}
          type={type}
          setOption={setOption}
          option={option}
          isOnboarding={isOnboarding}
          vpsPlans={vpsPlans as VpsPlan[]}
          dFlowAccountDetails={dFlowAccountDetails}
        />
      ) : (
        <ServerFormContent
          type={type}
          sshKeys={sshKeys}
          securityGroups={securityGroups}
          server={server}
          formType={formType}
          onBack={handleResetType}
          isOnboarding={isOnboarding}
          vpsPlan={
            type === 'dFlow'
              ? vpsPlans?.find(p => p.slug === option)
              : undefined
          }
        />
      )}
    </div>
  )
}

export default ServerForm
