'use client'

import type { VpsPlan } from '../../actions/cloud/dFlow/types'
import { ComingSoonBadge } from '../ComingSoonBadge'
import SidebarToggleButton from '../SidebarToggleButton'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  Cloud,
  CreditCard,
  ExternalLink,
  Server,
  Wallet,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { parseAsString, useQueryState } from 'nuqs'
import React, { useEffect, useId, useState } from 'react'

import { checkPaymentMethodAction } from '@/actions/cloud/dFlow'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cloudProvidersList } from '@/lib/integrationList'
import { CloudProviderAccount, SecurityGroup, SshKey } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

import AttachCustomServerForm from './AttachCustomServerForm'
import { ConnectDFlowCloudButton } from './ConnectDFlowCloudButton'
import CreateEC2InstanceForm from './CreateEC2InstanceForm'
import { DflowVpsFormContainer } from './dflowVpsForm/DflowVpsFormContainer'

interface ServerSelectionFormProps {
  setType: (type: string) => void
  type: string
  setOption: (plan: string) => void
  option: string
  isOnboarding: boolean
  vpsPlans: VpsPlan[]
  dFlowAccounts?: CloudProviderAccount[]
  onAccountSelect: (accountId: string) => void
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
  dFlowAccounts?: CloudProviderAccount[]
  selectedDFlowAccount?: CloudProviderAccount
}

interface ServerFormProps {
  sshKeys: SshKey[]
  securityGroups?: SecurityGroup[]
  server?: ServerType
  formType?: 'create' | 'update'
  vpsPlans?: VpsPlan[]
  dFlowAccounts?: CloudProviderAccount[]
}

const ServerSelectionForm: React.FC<ServerSelectionFormProps> = ({
  setType,
  setOption,
  option,
  type,
  isOnboarding,
  vpsPlans,
  dFlowAccounts,
  onAccountSelect,
}) => {
  const id = useId()
  const [selectedType, setSelectedType] = useState<string>('manual')
  const [selectedOption, setSelectedOption] = useState<string>('manual')
  const [selectedDFlowAccount, setSelectedDFlowAccount] = useState<string>(
    dFlowAccounts?.[0]?.id || '',
  )
  const [paymentData, setPaymentData] = useState<{
    walletBalance: number
    validCardCount: number
  } | null>(null)

  const router = useRouter()

  const { execute: fetchPaymentData, isPending: isFetchingPaymentData } =
    useAction(checkPaymentMethodAction, {
      onSuccess: ({ data }) => {
        setPaymentData({
          walletBalance: data?.walletBalance,
          validCardCount: data?.validCardCount,
        })
      },
      onError: () => {
        setPaymentData(null)
      },
    })

  useEffect(() => {
    if (selectedDFlowAccount) {
      fetchPaymentData({ accountId: selectedDFlowAccount })
      onAccountSelect(selectedDFlowAccount)
    }
  }, [selectedDFlowAccount])

  const handleAccountChange = (accountId: string) => {
    setSelectedDFlowAccount(accountId)
    onAccountSelect(accountId)
  }

  const handleOptionChange = (value: string, type: string) => {
    setSelectedType(type)
    setSelectedOption(value)
  }

  const handleContinue = () => {
    setType(selectedType)
    setOption(selectedOption)
  }

  const formatSpecs = (plan: VpsPlan) => {
    return `${plan.cpu.cores}C ${plan.cpu.type} • ${plan.ram.size}${plan.ram.unit} RAM • ${plan.storageOptions?.[0]?.size}${plan.storageOptions?.[0]?.unit} ${plan.storageOptions?.[0]?.type}`
  }

  const formatPrice = (plan: VpsPlan) => {
    return plan.pricing?.[0] ? `${plan.pricing[0].price.toFixed(2)}/month` : ''
  }

  const selectedAccount = dFlowAccounts?.find(
    acc => acc.id === selectedDFlowAccount,
  )
  const dFlowAccountDetails = selectedAccount?.dFlowDetails

  const selectedPlan =
    selectedType === 'dFlow'
      ? vpsPlans?.find(p => p.slug === selectedOption)
      : null
  const planCost = selectedPlan?.pricing?.[0]?.price || 0
  const hasWalletBalance = paymentData
    ? paymentData.walletBalance >= planCost
    : false
  const hasValidCard = paymentData ? paymentData.validCardCount > 0 : false
  const canProceed = planCost === 0 || hasWalletBalance || hasValidCard

  const getContinueButtonText = () => {
    if (selectedType === 'manual') {
      return 'Continue with Manual Setup'
    } else if (selectedType === 'dFlow') {
      return `Continue with ${vpsPlans?.find(p => p.slug === selectedOption)?.name}`
    }
    return `Continue with ${cloudProvidersList.find(p => p.slug === selectedOption)?.label || 'Selected Provider'}`
  }

  const getPaymentRecommendations = () => {
    const recommendations: React.ReactNode[] = []

    if (!paymentData) return recommendations

    if (planCost === 0) {
      recommendations.push(
        'This service is free. You can proceed without any payment.',
      )
    } else if (hasWalletBalance && hasValidCard) {
      recommendations.push(
        `You can use your wallet balance ($${paymentData.walletBalance.toFixed(2)}) or your saved payment card.`,
      )
    } else if (hasWalletBalance) {
      recommendations.push(
        `You can use your wallet balance ($${paymentData.walletBalance.toFixed(2)}) for this purchase.`,
      )
    } else if (hasValidCard) {
      recommendations.push(
        'Your saved payment card will be charged for this service.',
      )
    } else {
      recommendations.push(
        'You need to add a payment method or top up your wallet to proceed.',
      )
      recommendations.push(
        <span key='required-amount'>
          Required amount: ${planCost.toFixed(2)}
        </span>,
      )
      recommendations.push(
        <Card key='payment-card' className='mt-4'>
          <CardContent className='p-4'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-start gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted'>
                  <CreditCard className='h-5 w-5 text-muted-foreground' />
                </div>
                <div>
                  <p className='font-medium'>Payment Setup Required</p>
                  <div className='mt-1 flex flex-col gap-1 text-sm sm:flex-row sm:items-center'>
                    <span className='text-muted-foreground'>
                      Add a payment method or top up your wallet
                    </span>
                    <span className='hidden text-muted-foreground sm:inline'>
                      •
                    </span>
                    <span className='font-semibold'>
                      ${planCost.toFixed(2)} required
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant='outline'
                size='sm'
                className='w-full gap-2 sm:w-fit'
                onClick={() =>
                  window.open('https://dflow.sh/profile/cards', '_blank')
                }>
                Open dFlow
                <ExternalLink className='h-4 w-4' />
              </Button>
            </div>
          </CardContent>
        </Card>,
      )
    }

    return recommendations
  }

  return (
    <div className='space-y-8'>
      {!isOnboarding && (
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-semibold'>
              Choose a Deployment Option
            </h2>
            <p className='mt-1 text-muted-foreground'>
              Select a cloud provider or add server details manually
            </p>
          </div>
          <Button
            size='default'
            variant={'outline'}
            onClick={handleContinue}
            // disabled={
            //   !selectedOption || (selectedType === 'dFlow' && !canProceed)
            // }
          >
            {getContinueButtonText()}
            <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </div>
      )}

      <div className='space-y-6'>
        {/* dFlow Cloud Section */}
        <Card className='border shadow-sm'>
          <CardHeader className='pb-0'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg font-medium'>dFlow</CardTitle>
              {dFlowAccounts && dFlowAccounts.length > 0 && (
                <Select
                  value={selectedDFlowAccount}
                  onValueChange={handleAccountChange}>
                  <SelectTrigger className='w-fit'>
                    <SelectValue placeholder='Select dFlow account' />
                  </SelectTrigger>
                  <SelectContent>
                    {dFlowAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name || 'dFlow Account'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          <CardContent className='p-6'>
            {!dFlowAccountDetails?.accessToken ? (
              <div className='flex justify-center'>
                <ConnectDFlowCloudButton />
              </div>
            ) : (
              <>
                <RadioGroup
                  className='grid grid-cols-1 gap-6 md:grid-cols-2'
                  value={selectedOption}
                  onValueChange={(value: string) =>
                    handleOptionChange(value, 'dFlow')
                  }>
                  {vpsPlans?.map(plan => (
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
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {formatSpecs(plan)}
                          </p>
                          <p className='text-sm font-medium text-primary'>
                            {formatPrice(plan)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>

                {/* Payment Status Section */}
                {selectedType === 'dFlow' && selectedOption && (
                  <div className='mt-6 space-y-3'>
                    {isFetchingPaymentData ? (
                      <div className='flex items-center gap-3 rounded-md border p-4'>
                        <Skeleton className='h-4 w-4 rounded-full' />
                        <div className='space-y-2'>
                          <Skeleton className='h-4 w-48' />
                          <Skeleton className='h-3 w-32' />
                        </div>
                      </div>
                    ) : paymentData ? (
                      <Alert variant={canProceed ? 'default' : 'warning'}>
                        <div className='flex items-start gap-3'>
                          {canProceed ? (
                            <CheckCircle className='mt-0.5 h-5 w-5 text-green-600' />
                          ) : (
                            <AlertCircle className='mt-0.5 h-5 w-5 text-yellow-600' />
                          )}
                          <div className='flex-1 space-y-2'>
                            <div className='flex items-center gap-4 text-sm'>
                              <div className='flex items-center gap-2'>
                                <Wallet className='h-4 w-4' />
                                <span>
                                  Wallet: $
                                  {paymentData.walletBalance.toFixed(2)}
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <CreditCard className='h-4 w-4' />
                                <span>Cards: {paymentData.validCardCount}</span>
                              </div>
                              {planCost > 0 && (
                                <div className='flex items-center gap-2'>
                                  <span>Cost: ${planCost.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                            {getPaymentRecommendations().length > 0 && (
                              <AlertDescription className='text-sm'>
                                {getPaymentRecommendations().map(
                                  (rec, index) => (
                                    <div key={index} className='mb-1 last:mb-0'>
                                      {rec}
                                    </div>
                                  ),
                                )}
                              </AlertDescription>
                            )}
                          </div>
                        </div>
                      </Alert>
                    ) : null}
                  </div>
                )}
              </>
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
          disabled={
            !selectedOption || (selectedType === 'dFlow' && !canProceed)
          }
          onClick={handleContinue}>
          {getContinueButtonText()}
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
  dFlowAccounts,
  selectedDFlowAccount,
}) => {
  const router = useRouter()
  const { organisation } = useParams()

  if (!type) return null

  let providerName = ''

  if (type === 'manual') {
    providerName = 'Manual Server Configuration'
  } else if (type === 'dFlow') {
    providerName = `Configure dFlow Server`
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
            <DflowVpsFormContainer
              vpsPlan={vpsPlan as VpsPlan}
              dFlowAccounts={dFlowAccounts}
              selectedDFlowAccount={selectedDFlowAccount}
              sshKeys={sshKeys}
            />
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
  dFlowAccounts,
  vpsPlans,
}) => {
  const [type, setType] = useQueryState('type', parseAsString.withDefault(''))
  const [option, setOption] = useQueryState(
    'option',
    parseAsString.withDefault(''),
  )
  const [selectedDFlowAccount, setSelectedDFlowAccount] = useState<string>(
    dFlowAccounts?.[0]?.id || '',
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
          dFlowAccounts={dFlowAccounts}
          onAccountSelect={accountId => setSelectedDFlowAccount(accountId)}
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
          dFlowAccounts={dFlowAccounts}
          selectedDFlowAccount={dFlowAccounts?.find(
            acc => acc.id === selectedDFlowAccount,
          )}
        />
      )}
    </div>
  )
}

export default ServerForm
