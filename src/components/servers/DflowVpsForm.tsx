'use client'

import { Skeleton } from '../ui/skeleton'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  Camera,
  CheckCircle,
  CircuitBoard,
  Cpu,
  CreditCard,
  ExternalLink,
  HardDrive,
  Key,
  Network,
  Wallet,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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
  checkPaymentMethodAction,
  createSshKeysAndVpsAction,
} from '@/actions/cloud/dFlow'
import { VpsPlan } from '@/actions/cloud/dFlow/types'
import { generateSSHKeyAction } from '@/actions/sshkeys'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { CloudProviderAccount } from '@/payload-types'

const loginSchema = z.object({
  rootPassword: z.number().default(141086),
  sshKey: z.object({
    name: z
      .string()
      .min(1, { message: 'Name should be at-least than 1 character' })
      .max(50, { message: 'Name should be less than 50 characters' }),
    description: z.string().optional(),
    publicKey: z.string({ message: 'Public Key is required' }),
    privateKey: z.string({ message: 'Private Key is required' }),
  }),
})

const dflowVpsSchema = z.object({
  displayName: z
    .string()
    .min(1, { message: 'Display name is required' })
    .max(255, { message: 'Display name must be 255 characters or less' }),
  pricing: z.object({
    id: z.string().min(1, { message: 'Pricing plan is required' }),
    priceId: z.string().min(1, { message: 'priceId is required' }),
  }),
  region: z.object({
    name: z.string().min(1, { message: 'Region is required' }),
    priceId: z.string().min(1, { message: 'PriceId is required' }),
  }),
  storageType: z.object({
    productId: z.string().min(1, { message: 'Storage type is required' }),
    priceId: z.string().min(1, { message: 'PriceId is required' }),
  }),
  image: z.object({
    imageId: z.string().min(1, { message: 'Image is required' }),
    versionId: z.string().min(1, { message: 'Image version is required' }),
    priceId: z.string().min(1, { message: 'PriceId is required' }),
  }),
  login: loginSchema,
  backup: z.object({
    id: z.string().min(1, { message: 'Backup option is required' }),
    priceId: z.string().min(1, { message: 'PriceId is required' }),
  }),
})

type VpsFormData = z.infer<typeof dflowVpsSchema>

const DflowVpsForm: React.FC<{
  vpsPlan: VpsPlan
  dFlowAccounts?: CloudProviderAccount[]
  selectedDFlowAccount?: CloudProviderAccount
}> = ({ vpsPlan, dFlowAccounts, selectedDFlowAccount }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedDFlowAccountId, setSelectedDFlowAccountId] = useState<string>(
    selectedDFlowAccount?.id || dFlowAccounts?.[0]?.id || '',
  )
  const [paymentData, setPaymentData] = useState<{
    walletBalance: number
    validCardCount: number
  } | null>(null)

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
    if (selectedDFlowAccountId) {
      fetchPaymentData({ accountId: selectedDFlowAccountId })
    }
  }, [selectedDFlowAccountId])

  const handleAccountChange = (accountId: string) => {
    setSelectedDFlowAccountId(accountId)
  }

  const { execute: generateSSHKey, isPending: isGeneratingSSHKey } = useAction(
    generateSSHKeyAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          form.setValue('login.sshKey.name', handleGenerateName())
          form.setValue('login.sshKey.publicKey', data.publicKey)
          form.setValue('login.sshKey.privateKey', data.privateKey)
          toast.success('SSH key pair generated successfully')
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to generate SSH key: ${error.serverError}`)
      },
    },
  )

  useEffect(() => {
    generateSSHKey({ type: 'ed25519', comment: 'auto generated key' })
  }, [])

  const {
    execute: executeCreateSshKeysAndVpsAction,
    isPending: isCreatingVpsOrder,
  } = useAction(createSshKeysAndVpsAction, {
    onSuccess: () => {
      toast.success('Server instance created successfully')
    },
    onError: () => {
      toast.error('Failed to create server instance, try again')
    },
  })

  const form = useForm<VpsFormData>({
    resolver: zodResolver(dflowVpsSchema),
    defaultValues: {
      login: {
        rootPassword: 141086,
      },
    },
    mode: 'all',
  })

  const formState = form.formState
  const isFormValid = formState.isValid
  const formErrors = Object.keys(formState.errors).length > 0

  useEffect(() => {
    if (vpsPlan) {
      const displayName = handleGenerateName()
      form.setValue('displayName', displayName)

      // Set default pricing (first available)
      if (vpsPlan.pricing?.length) {
        form.setValue('pricing', {
          id: vpsPlan.pricing[0].id,
          priceId: vpsPlan.pricing[0].stripePriceId || '',
        })
      }

      // Set default region (first available)
      if (vpsPlan.regionOptions?.length) {
        form.setValue('region', {
          name: vpsPlan.regionOptions[0].regionCode || '',
          priceId: vpsPlan.regionOptions[0].stripePriceId || '',
        })
      }

      // Set default storage (first available)
      if (vpsPlan.storageOptions?.length) {
        form.setValue('storageType', {
          productId: vpsPlan.storageOptions[0].productId || '',
          priceId: vpsPlan.storageOptions[0].stripePriceId || '',
        })
      }

      // Set default image (first available)
      if (vpsPlan.images?.length && vpsPlan.images[0].versions?.length) {
        form.setValue('image', {
          imageId: vpsPlan.images[0].id || '',
          versionId: vpsPlan.images[0].versions[0].imageId || '',
          priceId: vpsPlan.images[0].versions[0].stripePriceId || '',
        })
      }

      // Set default backup (first available)
      if (vpsPlan.backupOptions?.length) {
        form.setValue('backup', {
          id: vpsPlan.backupOptions[0].id || '',
          priceId: vpsPlan.backupOptions[0].stripePriceId || '',
        })
      }
    }
  }, [vpsPlan])

  const selectedTerm = form.watch('pricing')
  const selectedImageId = form.watch('image.imageId')
  const selectedImageVersionId = form.watch('image.versionId')
  const selectedPricing = vpsPlan?.pricing?.find(
    p => p.id === form.watch('pricing.id'),
  )

  const selectedImage = vpsPlan?.images?.find(
    image => image.id === selectedImageId,
  )

  const selectedRegion = vpsPlan?.regionOptions?.find(
    region => region.regionCode === form.watch('region.name'),
  )

  const selectedStorage = vpsPlan?.storageOptions?.find(
    storage => storage.productId === form.watch('storageType.productId'),
  )

  const selectedBackup = vpsPlan?.backupOptions?.find(
    backup => backup.id === form.watch('backup.id'),
  )

  const calculateTotalCost = () => {
    const pricingCost = selectedPricing?.price || 0
    const regionCost =
      selectedRegion?.price.type === 'paid'
        ? selectedRegion.price.amount || 0
        : 0
    const imageCost =
      selectedImage?.versions?.find(v => v.imageId === selectedImageVersionId)
        ?.price.type === 'paid'
        ? selectedImage?.versions?.find(
            v => v.imageId === selectedImageVersionId,
          )?.price.amount || 0
        : 0
    const backupCost =
      selectedBackup?.price.type === 'paid'
        ? selectedBackup.price.amount || 0
        : 0

    return pricingCost + regionCost + imageCost + backupCost
  }

  const planCost = calculateTotalCost()
  const hasWalletBalance = paymentData
    ? paymentData.walletBalance >= planCost
    : false
  const hasValidCard = paymentData ? paymentData.validCardCount > 0 : false
  const canProceed = hasWalletBalance || hasValidCard

  const getPaymentRecommendations = () => {
    const recommendations: React.ReactNode[] = []

    if (!paymentData) return recommendations

    if (hasWalletBalance && hasValidCard) {
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

  const handleCancel = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('selectedVps')

    router.push(`?${params.toString()}`, { scroll: false })
  }

  const onSubmit = (data: VpsFormData) => {
    if (!canProceed) {
      toast.error('Please ensure you have sufficient payment method')
      return
    }

    executeCreateSshKeysAndVpsAction({
      accountId: selectedDFlowAccountId,
      sshKeys: [
        {
          name: data.login.sshKey.name,
          publicSshKey: data.login.sshKey.publicKey,
          privateSshKey: data.login.sshKey.privateKey,
        },
      ],
      vps: {
        name: data.displayName,
        pricingId: data.pricing.id,
        regionCode: data.region.name,
        storageProductId: data.storageType.productId,
        imageId: data.image.imageId,
        imageVersionId: data.image.versionId,
        backupId: data.backup.id,
      },
    })
  }

  const sshKeyName = form.watch('login.sshKey.name')
  const publicKey = form.watch('login.sshKey.publicKey')
  const privateKey = form.watch('login.sshKey.privateKey')

  return (
    <section>
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-2xl font-bold text-foreground'>
            {vpsPlan?.name}
          </div>
          <div className='text-muted-foreground'>
            Configure your server instance
          </div>
        </div>
      </div>

      {/* Account Selection */}
      {dFlowAccounts && dFlowAccounts.length > 0 && (
        <div className='my-6'>
          <FormField
            control={form.control}
            name='displayName'
            render={() => (
              <FormItem>
                <FormLabel>dFlow Account</FormLabel>
                <Select
                  value={selectedDFlowAccountId}
                  onValueChange={handleAccountChange}>
                  <SelectTrigger className='bg-background'>
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
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Payment Status */}
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
                    <span>Wallet: ${paymentData.walletBalance.toFixed(2)}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <CreditCard className='h-4 w-4' />
                    <span>Cards: {paymentData.validCardCount}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span>Cost: ${planCost.toFixed(2)}</span>
                  </div>
                </div>
                {getPaymentRecommendations().length > 0 && (
                  <AlertDescription className='text-sm'>
                    {getPaymentRecommendations().map((rec, index) => (
                      <div key={index} className='mb-1 last:mb-0'>
                        {rec}
                      </div>
                    ))}
                  </AlertDescription>
                )}
              </div>
            </div>
          </Alert>
        ) : null}
      </div>

      {/* Specs Overview */}
      <div className='mb-6 mt-6'>
        <h2 className='mb-3 text-lg font-semibold text-foreground'>
          Server Specifications
        </h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardContent className='flex h-full flex-col p-4'>
              <div className='mb-2 flex items-center space-x-2'>
                <Cpu className='h-5 w-5 text-primary' />
                <h3 className='font-semibold text-foreground'>CPU</h3>
              </div>
              <p className='text-muted-foreground'>
                {`${vpsPlan?.cpu.cores} ${vpsPlan?.cpu.type === 'virtual' ? 'vCPU' : 'CPU'} Cores`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='flex h-full flex-col p-4'>
              <div className='mb-2 flex items-center space-x-2'>
                <CircuitBoard className='h-5 w-5 text-primary' />
                <h3 className='font-semibold text-foreground'>RAM</h3>
              </div>
              <p className='text-muted-foreground'>
                {`${vpsPlan?.ram.size} ${vpsPlan?.ram.unit} RAM`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='flex h-full flex-col p-4'>
              <div className='mb-2 flex items-center space-x-2'>
                <HardDrive className='h-5 w-5 text-primary' />
                <h3 className='font-semibold text-foreground'>Storage</h3>
              </div>
              <p className='text-muted-foreground'>
                {vpsPlan?.storageOptions
                  ?.map(s => `${s.size} ${s.unit} ${s.type}`)
                  .join(' or ')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='flex h-full flex-col p-4'>
              <div className='mb-2 flex items-center space-x-2'>
                <Camera className='h-5 w-5 text-primary' />
                <h3 className='font-semibold text-foreground'>Snapshot</h3>
              </div>
              <p className='text-muted-foreground'>
                {`${vpsPlan?.snapshots} ${vpsPlan?.snapshots === 1 ? 'Snapshot' : 'Snapshots'}`}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='mb-6'>
        <Card>
          <CardContent className='flex items-center p-4'>
            <Network className='mr-2 h-5 w-5 text-primary' />
            <div>
              <h3 className='font-semibold text-foreground'>Traffic</h3>
              <p className='text-muted-foreground'>
                <span className='font-medium'>{`${vpsPlan?.bandwidth.traffic} ${vpsPlan?.bandwidth.trafficUnit} Traffic`}</span>
                <span className='text-sm'>{` (${vpsPlan?.bandwidth.incomingUnlimited ? 'Unlimited Incoming' : ''} )`}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {formErrors && (
            <Alert variant='destructive' className='mb-6'>
              <AlertDescription>
                Please fix the errors in the form before submitting.
              </AlertDescription>
            </Alert>
          )}

          {/* Display Name */}
          <div className='mb-6'>
            <FormField
              control={form.control}
              name='displayName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Display Name <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className='w-full bg-background'
                      type='text'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Term Length */}
          <div className='mb-6'>
            <h2 className='mb-3 text-lg font-semibold text-foreground'>
              Term Length <span className='text-destructive'>*</span>
            </h2>
            <RadioGroup
              value={selectedTerm?.id}
              onValueChange={value => {
                const selected = vpsPlan?.pricing?.find(p => p.id === value)
                if (selected) {
                  form.setValue('pricing', {
                    id: selected.id,
                    priceId: selected.stripePriceId || '',
                  })
                }
              }}
              className='flex w-full flex-col gap-4 sm:flex-row'>
              {vpsPlan?.pricing?.map(plan => (
                <div
                  key={plan.id}
                  className={`relative flex-1 transition-transform duration-300 ${
                    plan.id === selectedTerm?.id ? 'scale-100' : 'scale-95'
                  }`}>
                  <RadioGroupItem
                    value={plan.id as string}
                    id={`pricing-${plan.id}`}
                    className='hidden h-4 w-4'
                  />
                  {plan.id === selectedTerm?.id && (
                    <CheckCircle
                      className='absolute right-4 top-3 text-primary'
                      size={20}
                    />
                  )}
                  <label
                    htmlFor={`pricing-${plan.id}`}
                    className={`block w-full cursor-pointer rounded-lg p-4 transition-all duration-300 ease-in-out ${
                      plan.id === selectedTerm?.id
                        ? 'border-2 border-primary bg-secondary/10'
                        : 'border-2 border-transparent bg-secondary/5'
                    }`}>
                    <div className='text-lg text-foreground'>{`${plan.period} ${plan.period === 1 ? 'Month' : 'Months'}`}</div>
                    <div className='text-muted-foreground'>
                      {Boolean(plan.offerPrice) ? (
                        <div>
                          <span className='line-through'>{`${formatValue(plan.price)} / month`}</span>
                          <span>{` ${formatValue(plan.offerPrice as number)} / month`}</span>
                        </div>
                      ) : (
                        <div>{`${formatValue(plan.price)} / month`}</div>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Select Region */}
          <div className='mb-6'>
            <FormField
              control={form.control}
              name='region.name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Region <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={value => {
                        const selectedRegion = vpsPlan?.regionOptions?.find(
                          r => r.regionCode === value,
                        )
                        if (selectedRegion) {
                          form.setValue('region', {
                            name: selectedRegion.regionCode,
                            priceId: selectedRegion.stripePriceId || '',
                          })
                        }
                      }}>
                      <SelectTrigger className='bg-background'>
                        <SelectValue placeholder='Select region' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Available Regions</SelectLabel>
                          {vpsPlan?.regionOptions?.map(region => (
                            <SelectItem
                              key={region.regionCode}
                              value={region.regionCode}>
                              {region.region}{' '}
                              {region.price.type === 'free'
                                ? '(Free)'
                                : `(${formatValue(region.price.amount || 0)})`}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Select Storage Type */}
          <div className='mb-6'>
            <FormField
              control={form.control}
              name='storageType.productId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Storage Type <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={value => {
                        const selectedStorage = vpsPlan?.storageOptions?.find(
                          s => s.productId === value,
                        )
                        if (selectedStorage) {
                          form.setValue('storageType', {
                            productId: selectedStorage.productId,
                            priceId: selectedStorage.stripePriceId || '',
                          })
                        }
                      }}>
                      <SelectTrigger className='bg-background'>
                        <SelectValue placeholder='Select storage type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Available Storage Types</SelectLabel>
                          {vpsPlan?.storageOptions?.map(storage => (
                            <SelectItem
                              key={storage.productId}
                              value={storage.productId}>
                              {storage.size} {storage.unit} {storage.type}{' '}
                              {storage.price.type === 'free'
                                ? '(Free)'
                                : `(${formatValue(storage.price.amount || 0)})`}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Select Image */}
          <div className='mb-6'>
            <h2 className='mb-3 text-lg font-semibold text-foreground'>
              Image <span className='text-destructive'>*</span>
            </h2>
            <RadioGroup
              value={selectedImageId}
              onValueChange={value => {
                const selectedImage = vpsPlan?.images?.find(i => i.id === value)
                if (selectedImage && selectedImage.versions?.length) {
                  form.setValue('image', {
                    imageId: selectedImage.id,
                    versionId: selectedImage.versions[0].imageId,
                    priceId: selectedImage.versions[0].stripePriceId || '',
                  })
                }
              }}
              className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {vpsPlan?.images?.map(image => {
                const selectedVersion = image.versions?.find(
                  version => version.imageId === selectedImageVersionId,
                )

                return (
                  <div
                    key={image.id}
                    className={`relative transition-transform duration-300 ${
                      selectedImageId === image.id ? 'scale-100' : 'scale-95'
                    }`}>
                    {selectedImageId === image.id && (
                      <CheckCircle
                        className='absolute right-4 top-3 text-primary'
                        size={20}
                      />
                    )}
                    <RadioGroupItem
                      value={image.id as string}
                      id={`image-${image.id}`}
                      className='hidden h-4 w-4'
                    />
                    <label
                      htmlFor={`image-${image.id}`}
                      className={`flex h-full w-full cursor-pointer flex-col rounded-lg p-4 transition-all duration-300 ease-in-out ${
                        selectedImageId === image.id
                          ? 'border-2 border-primary bg-secondary/10'
                          : 'border-2 border-transparent bg-secondary/5'
                      }`}>
                      <div className='text-lg text-foreground'>
                        {image.label}
                      </div>
                      <div className='text-muted-foreground'>
                        {selectedVersion?.label || 'Latest'}
                      </div>
                      <div className='mt-2 text-primary'>
                        {selectedVersion?.price.type === 'included'
                          ? 'Included'
                          : formatValue(
                              selectedVersion?.price.amount as number,
                            )}
                      </div>
                    </label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          {/* Image Version Selection */}
          {selectedImage &&
            selectedImage.versions &&
            selectedImage.versions.length > 1 && (
              <div className='mb-6'>
                <FormField
                  control={form.control}
                  name='image.versionId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Image Version{' '}
                        <span className='text-destructive'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={value => {
                            const selectedVersion =
                              selectedImage.versions?.find(
                                v => v.imageId === value,
                              )
                            if (selectedVersion) {
                              form.setValue('image', {
                                ...form.getValues('image'),
                                versionId: selectedVersion.imageId,
                                priceId: selectedVersion.stripePriceId || '',
                              })
                            }
                          }}>
                          <SelectTrigger className='bg-background'>
                            <SelectValue placeholder='Select image version' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Available Versions</SelectLabel>
                              {selectedImage.versions?.map(version => (
                                <SelectItem
                                  key={version.imageId}
                                  value={version.imageId}>
                                  {version.label}{' '}
                                  {version.price.type === 'included'
                                    ? '(Included)'
                                    : `(${formatValue(version.price.amount || 0)})`}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

          {/* Server Login Details */}
          <div className='mb-6'>
            <h2 className='mb-3 text-lg font-semibold text-foreground'>
              Server Login Details <span className='text-destructive'>*</span>
            </h2>
            <div className='space-y-4 rounded-lg border border-border p-4'>
              <FormField
                control={form.control}
                name='login.rootPassword'
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Username <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        id='defaultUser'
                        className='w-full bg-background'
                        type='text'
                        value='root'
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='login.rootPassword'
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Password <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        id='rootPassword'
                        className='w-full bg-background'
                        type='text'
                        value='141086'
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* SSH Key Details */}
          <div className='mb-6'>
            <h2 className='mb-3 text-lg font-semibold text-foreground'>
              SSH Key Details <span className='text-destructive'>*</span>
            </h2>
            <div className='space-y-4 rounded-lg border border-border p-4'>
              <div className='mb-2 flex items-center space-x-2'>
                <Key className='h-5 w-5 text-primary' />
                <h3 className='font-semibold text-foreground'>
                  SSH Authentication
                </h3>
              </div>

              <FormField
                control={form.control}
                name='login.sshKey.name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Key Name <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className='w-full bg-background'
                        type='text'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='login.sshKey.publicKey'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Public Key <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className='h-24 w-full bg-background font-mono text-sm'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='login.sshKey.privateKey'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Private Key <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className='h-40 w-full bg-background font-mono text-sm'
                      />
                    </FormControl>
                    <FormMessage />
                    <div className='mt-1 text-sm text-amber-500'>
                      Keep this private key secure. You will need it to access
                      your server.
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Backup Options */}
          {Boolean(vpsPlan?.backupOptions) && (
            <div className='mb-6'>
              <h2 className='mb-3 text-lg font-semibold text-foreground'>
                Data Protection with Auto Backup{' '}
                <span className='text-destructive'>*</span>
              </h2>
              <RadioGroup
                value={form.watch('backup.id')}
                onValueChange={value => {
                  const selectedBackup = vpsPlan?.backupOptions?.find(
                    b => b.id === value,
                  )
                  if (selectedBackup) {
                    form.setValue('backup', {
                      id: selectedBackup.id,
                      priceId: selectedBackup.stripePriceId || '',
                    })
                  }
                }}
                className='flex flex-col gap-4 sm:flex-row'>
                {vpsPlan?.backupOptions?.map(backupOption => {
                  const isSelected = backupOption.id === form.watch('backup.id')

                  return (
                    <div
                      key={backupOption.id}
                      className={`relative flex-1 transition-transform duration-300 ${
                        isSelected ? 'scale-100' : 'scale-95'
                      }`}>
                      {isSelected && (
                        <CheckCircle
                          className='absolute right-4 top-3 text-primary'
                          size={20}
                        />
                      )}
                      <RadioGroupItem
                        value={backupOption.id as string}
                        id={`backup-${backupOption.id}`}
                        className='hidden h-4 w-4'
                      />
                      <label
                        htmlFor={`backup-${backupOption.id}`}
                        className={`block h-full w-full cursor-pointer rounded-lg transition-all duration-300 ease-in-out ${
                          isSelected
                            ? 'border-2 border-primary bg-secondary/10'
                            : 'border-2 border-transparent bg-secondary/5'
                        } p-4`}>
                        <div className='mb-2'>
                          <span className='text-lg font-semibold text-foreground'>
                            {backupOption.label}
                          </span>
                        </div>
                        <div className='space-y-1 text-sm text-muted-foreground'>
                          <div>
                            <strong>Mode:</strong> {backupOption.mode}
                          </div>
                          <div>
                            <strong>Frequency:</strong> {backupOption.frequency}
                          </div>
                          <div>
                            <strong>Recovery:</strong> {backupOption.recovery}
                          </div>
                          <div>
                            <strong>Backup Retention:</strong>{' '}
                            {backupOption.retention || 'x'}
                          </div>
                        </div>
                        <div className='mt-2 font-bold text-primary'>
                          {backupOption.price.type === 'paid'
                            ? `${formatValue(backupOption.price.amount as number)} / month`
                            : 'Included'}
                        </div>
                        <div className='mt-2 text-sm text-muted-foreground'>
                          {backupOption.description}
                        </div>
                      </label>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>
          )}

          {/* Price Summary */}
          <div className='mb-6'>
            <h2 className='mb-3 text-lg font-semibold text-foreground'>
              Price Summary
            </h2>
            <div className='space-y-4 rounded-lg border border-border p-4'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>
                  {vpsPlan?.name} ({selectedPricing?.period || 1} Month)
                </span>
                <span className='text-foreground'>
                  {selectedPricing?.offerPrice
                    ? formatValue(selectedPricing.offerPrice)
                    : formatValue(selectedPricing?.price || 0)}
                </span>
              </div>

              {selectedRegion && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    Region: {selectedRegion.region}
                  </span>
                  <span className='text-foreground'>
                    {selectedRegion.price.type === 'free'
                      ? 'Free'
                      : formatValue(selectedRegion.price.amount || 0)}
                  </span>
                </div>
              )}

              {selectedStorage && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    Storage: {selectedStorage.size} {selectedStorage.unit}{' '}
                    {selectedStorage.type}
                  </span>
                  <span className='text-foreground'>
                    {selectedStorage.price.type === 'free'
                      ? 'Free'
                      : formatValue(selectedStorage.price.amount || 0)}
                  </span>
                </div>
              )}

              {selectedImage && selectedImageVersionId && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    Image: {selectedImage.label}
                  </span>
                  <span className='text-foreground'>
                    {selectedImage.versions?.find(
                      v => v.imageId === selectedImageVersionId,
                    )?.price.type === 'included'
                      ? 'Included'
                      : formatValue(
                          selectedImage.versions?.find(
                            v => v.imageId === selectedImageVersionId,
                          )?.price.amount || 0,
                        )}
                  </span>
                </div>
              )}

              {selectedBackup && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    Backup: {selectedBackup.label}
                  </span>
                  <span className='text-foreground'>
                    {selectedBackup.price.type === 'included'
                      ? 'Included'
                      : formatValue(selectedBackup.price.amount || 0)}
                  </span>
                </div>
              )}

              <Separator className='my-2' />

              <div className='flex justify-between'>
                <span className='font-bold text-foreground'>
                  Total ({selectedPricing?.period || 1} month)
                </span>
                <span className='text-lg text-primary'>
                  {formatValue(planCost)}
                </span>
              </div>
            </div>
          </div>

          <div className='flex justify-end space-x-4'>
            <Button type='button' variant='outline' onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isCreatingVpsOrder || !canProceed}
              className='bg-primary text-primary-foreground hover:bg-primary/90'>
              {isCreatingVpsOrder ? 'Creating...' : 'Place Order'}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}

export default DflowVpsForm

const formatValue = (value: number, currency?: string): string =>
  Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(value)

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
