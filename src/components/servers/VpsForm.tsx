'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
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

import { createSshKeysAndVpsAction } from '@/actions/cloud/dFlow'
import { VpsPlan } from '@/actions/cloud/dFlow/types'
import { generateSSHKeyAction } from '@/actions/sshkeys'
import { Button } from '@/components/ui/button'
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

const vpsSchema = z.object({
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

type VpsFormData = z.infer<typeof vpsSchema>

const VpsForm: React.FC<{
  vpsPlan: VpsPlan
}> = ({ vpsPlan }) => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const { execute: generateSSHKey, isPending: isGeneratingSSHKey } = useAction(
    generateSSHKeyAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          setValue('login.sshKey.name', handleGenerateName())
          setValue('login.sshKey.publicKey', data.publicKey)
          setValue('login.sshKey.privateKey', data.privateKey)
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

  // Action for creating VPS order
  const {
    execute: executeCreateSshKeysAndVpsAction,
    isPending: isCreatingVpsOrder,
  } = useAction(createSshKeysAndVpsAction, {
    onSuccess: () => {
      toast.success('Server instance created successfully')
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', 'my-vps')
      params.delete('selectedVps')

      router.push(`?${params.toString()}`, { scroll: false })
    },
    onError: () => {
      toast.error('Failed to create server instance, try again')
    },
  })

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
    reset,
  } = useForm<VpsFormData>({
    resolver: zodResolver(vpsSchema),
    defaultValues: {
      login: {
        rootPassword: 141086,
      },
    },
  })

  useEffect(() => {
    if (vpsPlan) {
      const selectedPricing = vpsPlan.pricing?.find(p => p.period === 1)
      const freeRegion = vpsPlan?.regionOptions?.find(
        region => region.price.type === 'free',
      )
      const freeStorageType = vpsPlan?.storageOptions?.find(
        storage => storage.price.type === 'free',
      )
      const freeBackup = vpsPlan?.backupOptions?.find(
        backup => backup.price.type === 'included',
      )
      const displayName = handleGenerateName()

      setValue('displayName', displayName)
      setValue('pricing', {
        id: selectedPricing?.id || vpsPlan?.pricing?.at(0)?.id || '',
        priceId:
          selectedPricing?.stripePriceId ||
          vpsPlan?.pricing?.at(0)?.stripePriceId ||
          '',
      })
      setValue('region', {
        name:
          freeRegion?.regionCode ||
          vpsPlan?.regionOptions?.at(0)?.regionCode ||
          '',
        priceId:
          freeRegion?.stripePriceId ||
          vpsPlan?.regionOptions?.at(0)?.stripePriceId ||
          '',
      })
      setValue('storageType', {
        productId: freeStorageType
          ? freeStorageType?.productId!
          : vpsPlan?.storageOptions?.at(0)?.productId!,
        priceId: freeStorageType
          ? freeStorageType?.stripePriceId
          : vpsPlan?.storageOptions?.at(0)?.stripePriceId!,
      })
      setValue('image', {
        imageId: vpsPlan?.images?.at(0)?.id || '',
        versionId: vpsPlan?.images?.at(0)?.versions?.at(0)?.imageId || '',
        priceId: vpsPlan?.images?.at(0)?.versions?.at(0)?.stripePriceId || '',
      })
      setValue('backup', {
        id: freeBackup?.id || vpsPlan?.backupOptions?.at(0)?.id || '',
        priceId:
          freeBackup?.stripePriceId ||
          vpsPlan?.backupOptions?.at(0)?.stripePriceId ||
          '',
      })
    }
  }, [])

  const selectedTerm = watch('pricing')
  const selectedImageId = watch('image.imageId')
  const selectedImageVersionId = watch('image.versionId')
  const selectedPricing = vpsPlan?.pricing?.find(
    p => p.id === watch('pricing.id'),
  )

  const selectedImage = vpsPlan?.images?.find(
    image => image.id === selectedImageId,
  )

  const handleCancel = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('selectedVps')

    router.push(`?${params.toString()}`, { scroll: false })
  }

  const onSubmit = (data: VpsFormData) => {
    console.log({ data })

    executeCreateSshKeysAndVpsAction({
      sshKeys: [
        {
          name: data.login.sshKey.name,
          publicSshKey: data.login.sshKey.publicKey,
        },
      ],
      vps: {
        name: data.displayName,
      },
    })
  }

  return (
    <section className='flex flex-col'>
      <div>
        <span className='bg-gradient-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text text-lg font-bold text-transparent md:text-2xl'>
          VPS Configuration
        </span>
      </div>

      <div className='mt-5'>
        <h4 className='text-cq-text text-lg font-medium'>{vpsPlan?.name}</h4>

        {/* VPS Specs */}
        <div className='mt-4'>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='bg-cq-foreground rounded-lg p-4 shadow-lg'>
              <strong className='text-cq-text text-lg'>CPU</strong>
              <p className='text-cq-text-secondary mt-2 text-sm'>{`${vpsPlan?.cpu.cores} ${vpsPlan?.cpu.type === 'virtual' ? 'vCPU' : 'CPU'} Cores`}</p>
            </div>

            <div className='bg-cq-foreground rounded-lg p-4 shadow-lg'>
              <strong className='text-cq-text text-lg'>RAM</strong>
              <p className='text-cq-text-secondary mt-2 text-sm'>{`${vpsPlan?.ram.size} ${vpsPlan?.ram.unit} RAM`}</p>
            </div>

            <div className='bg-cq-foreground rounded-lg p-4 shadow-lg'>
              <strong className='text-cq-text text-lg'>Storage</strong>
              <p className='text-cq-text-secondary mt-2 text-sm'>
                {
                  vpsPlan?.storageOptions
                    ?.filter(s => s.price.type === 'free')
                    .map(s => `${s.size} ${s.type}`)
                    .join(' or ') as string
                }
              </p>
            </div>

            <div className='bg-cq-foreground rounded-lg p-4 shadow-lg'>
              <strong className='text-cq-text text-lg'>Snapshot</strong>
              <p className='text-cq-text-secondary mt-2 text-sm'>{`${vpsPlan?.snapshots} ${vpsPlan?.snapshots === 1 ? 'Snapshot' : 'Snapshots'}`}</p>
            </div>

            <div className='bg-cq-foreground col-span-1 rounded-lg p-4 shadow-lg sm:col-span-2 lg:col-span-4'>
              <strong className='text-cq-text text-lg'>Traffic</strong>
              <p className='text-cq-text-secondary mt-2 text-sm'>
                <span className='font-semibold'>{`${vpsPlan?.bandwidth.traffic} ${vpsPlan?.bandwidth.trafficUnit} Traffic`}</span>
                <span className='text-sm'>{` (${vpsPlan?.bandwidth.incomingUnlimited ? 'Unlimited Incoming' : ''} )`}</span>
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='mt-6 flex flex-col gap-y-5'>
          {/* Display Name */}
          <div>
            <label
              className='mb-1 block text-sm font-medium text-slate-300'
              htmlFor='displayName'>
              Display Name <span className='text-cq-danger'>*</span>
            </label>
            <Input
              {...register('displayName')}
              id='displayName'
              className='w-full'
              type='text'
              disabled={true}
            />
            {errors?.displayName && (
              <p className='text-cq-danger mt-1 text-xs'>
                {errors?.displayName.message}
              </p>
            )}
          </div>

          {/* Select Term Length (Read-only) */}
          <div>
            <div className='mb-1 flex items-center justify-between'>
              <label
                className='block text-sm font-medium text-slate-300'
                htmlFor='termLength'>
                Term Length <span className='text-cq-danger'>*</span>
              </label>
            </div>

            <RadioGroup
              value={selectedTerm?.id}
              disabled={true}
              className='flex w-full'>
              {vpsPlan?.pricing?.map(plan => {
                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-1 items-center transition-transform duration-300 ${
                      plan.period === 1 ? 'scale-100' : 'scale-95'
                    }`}>
                    <RadioGroupItem
                      value={plan.id as string}
                      id={`pricing-${plan.id}`}
                      className='hidden h-4 w-4'
                      disabled
                    />
                    {plan.period === 1 && (
                      <CheckCircle
                        className='stroke-cq-success absolute right-4 top-3'
                        size={20}
                      />
                    )}
                    <label
                      htmlFor={`pricing-${plan.id}`}
                      className={`bg-cq-foreground w-full cursor-not-allowed rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out ${
                        plan.period === 1
                          ? 'border-cq-primary border-2'
                          : 'border-2 border-transparent'
                      }`}>
                      <div className='text-cq-text text-lg'>{`${plan.period} ${plan.period === 1 ? 'Month' : 'Months'}`}</div>
                      <div className='text-cq-text-secondary'>
                        {Boolean(plan.offerPrice) ? (
                          <div>
                            <span className='line-through'>{`${formatValue(plan.price)} / month`}</span>
                            <span>{` ${formatValue(plan.offerPrice as number)} / month`}</span>
                          </div>
                        ) : (
                          <div className='text-cq-text-secondary'>{`${formatValue(plan.price)} / month`}</div>
                        )}
                      </div>
                    </label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          {/* Select Region (Read-only) */}
          <div>
            <label
              className='mb-1 block text-sm font-medium text-slate-300'
              htmlFor='region'>
              Region <span className='text-cq-danger'>*</span>
            </label>

            <Select disabled value='EU'>
              <SelectTrigger>
                <SelectValue>
                  {vpsPlan?.regionOptions?.find(r => r.regionCode === 'EU')
                    ?.region || 'Europe'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Region is pre-selected</SelectLabel>
                  <SelectItem value='EU'>Europe</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Select Storage Type (Read-only) */}
          <div>
            <label
              className='mb-1 block text-sm font-medium text-slate-300'
              htmlFor='storageType'>
              Storage Type <span className='text-cq-danger'>*</span>
            </label>

            <Select disabled value='V92'>
              <SelectTrigger>
                <SelectValue>
                  {vpsPlan?.storageOptions?.find(s => s.productId === 'V92')
                    ?.size || '40'}{' '}
                  GB SSD
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Storage type is pre-selected</SelectLabel>
                  <SelectItem value='V92'>40 GB SSD</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Select Image (Read-only) */}
          <div>
            <div className='mb-1 flex items-center justify-between'>
              <label className='block text-sm font-medium text-slate-300'>
                Image <span className='text-cq-danger'>*</span>
              </label>
            </div>

            <RadioGroup
              value={selectedImageId}
              disabled={true}
              className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {vpsPlan?.images?.map(image => {
                const selectedVersion = image.versions?.find(
                  version => version.imageId === selectedImageVersionId,
                )

                return (
                  <div
                    key={image.id}
                    className={`relative flex flex-1 items-stretch ${
                      selectedImageId === image.id ? 'scale-100' : 'scale-95'
                    }`}>
                    {selectedImageId === image.id && (
                      <CheckCircle
                        className='stroke-cq-success absolute right-4 top-3'
                        size={20}
                      />
                    )}
                    <RadioGroupItem
                      value={image.id as string}
                      id={`image-${image.id}`}
                      className='hidden h-4 w-4'
                      disabled
                    />
                    <label
                      htmlFor={`image-${image.id}`}
                      className={`bg-cq-foreground flex w-full cursor-not-allowed flex-col justify-center rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out ${
                        selectedImageId === image.id
                          ? 'border-cq-primary border-2'
                          : 'border-2 border-transparent'
                      } h-full`}>
                      <div className='text-cq-text text-lg'>{image.label}</div>
                      <div className='text-cq-text-secondary'>
                        {selectedVersion?.label || 'Latest'}
                      </div>
                      <div className='text-cq-text-secondary'>
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

          {/* Server Login Details */}
          <div>
            <label className='mb-1 block text-sm font-medium text-slate-300'>
              Server Login Details <span className='text-cq-danger'>*</span>
            </label>

            <div className='mt-2'>
              <div>
                <label
                  className='mb-1 block text-sm font-medium text-slate-300'
                  htmlFor='defaultUser'>
                  Username <span className='text-cq-danger'>*</span>
                </label>
                <Input
                  id='defaultUser'
                  className='w-full'
                  type='text'
                  value='root'
                  disabled
                />
              </div>
              <div className='mt-1'>
                <label
                  className='mb-1 block text-sm font-medium text-slate-300'
                  htmlFor='rootPassword'>
                  Password <span className='text-cq-danger'>*</span>
                </label>
                <Input
                  id='rootPassword'
                  className='w-full'
                  type='text'
                  value='141086'
                  disabled
                />
              </div>

              {/* {vpsPlan?.loginDetails.useSSHKeys && (
                <div className='mt-1'>
                  <label
                    className='mb-1 block text-sm font-medium text-slate-300'
                    htmlFor='sshKeys'>
                    SSH Keys
                  </label>

                  <FormField
                    control={control}
                    name='login.sshKey'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SSH Key</FormLabel>
                        {isCreating ? (
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
                        ) : (
                          <>
                            <Input
                              value={
                                typeof server?.sshKey === 'string'
                                  ? server?.sshKey
                                  : server?.sshKey?.name || 'N/A'
                              }
                              disabled
                              className='bg-muted'
                            />
                            <p className='mt-1 text-xs text-muted-foreground'>
                              SSH keys cannot be updated after instance creation
                            </p>
                          </>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )} */}
            </div>
          </div>

          {/* Backup Options (Read-only) */}
          {Boolean(vpsPlan?.backupOptions) && (
            <div className='mt-4'>
              <label className='mb-1 block text-sm font-medium text-slate-300'>
                Data Protection with Auto Backup{' '}
                <span className='text-cq-danger'>*</span>
              </label>

              <RadioGroup
                value={watch('backup.id')}
                disabled={true}
                className='flex'>
                {vpsPlan?.backupOptions?.map(backupOption => {
                  const isSelected = backupOption.price.type === 'included'

                  return (
                    <div
                      key={backupOption.id}
                      className={`relative flex flex-1 items-stretch ${
                        isSelected ? 'scale-100' : 'scale-95'
                      }`}>
                      {isSelected && (
                        <CheckCircle
                          className='stroke-cq-success absolute right-4 top-3'
                          size={20}
                        />
                      )}
                      <RadioGroupItem
                        value={backupOption.id as string}
                        id={`backup-${backupOption.id}`}
                        className='hidden h-4 w-4'
                        disabled
                      />
                      <label
                        htmlFor={`backup-${backupOption.id}`}
                        className={`bg-cq-foreground w-full cursor-not-allowed rounded-lg border-2 p-4 shadow-lg transition-all duration-300 ease-in-out ${
                          isSelected
                            ? 'border-cq-primary border-2'
                            : 'border-2 border-transparent'
                        } h-full`}>
                        <div className='mb-2'>
                          <span className='text-cq-text text-lg font-semibold'>
                            {backupOption.label}
                          </span>
                        </div>
                        <div className='text-cq-text-secondary text-sm'>
                          <strong>Mode:</strong> {backupOption.mode}
                        </div>
                        <div className='text-cq-text-secondary text-sm'>
                          <strong>Frequency:</strong> {backupOption.frequency}
                        </div>
                        <div className='text-cq-text-secondary text-sm'>
                          <strong>Recovery:</strong> {backupOption.recovery}
                        </div>
                        <div className='text-cq-text-secondary text-sm'>
                          <strong>Backup Retention:</strong>{' '}
                          {backupOption.retention || 'x'}
                        </div>
                        <div className='text-cq-primary mt-2 font-bold'>
                          {backupOption.price.type === 'paid'
                            ? `${formatValue(backupOption.price.amount as number)} / month`
                            : 'Free'}
                        </div>
                        <div className='mt-2 text-sm text-gray-400'>
                          {backupOption.description}
                        </div>
                      </label>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>
          )}

          {/* Price Summary Section - Simplified */}
          <div className='bg-cq-foreground mt-6 rounded-lg p-5 shadow-lg'>
            <h3 className='text-cq-text mb-4 text-lg font-semibold'>
              Price Summary
            </h3>

            <div className='space-y-3'>
              {/* Base Plan */}
              <div className='flex justify-between'>
                <span className='text-cq-text-secondary'>
                  {vpsPlan?.name} (1 Month)
                </span>
                <span className='text-cq-text'>
                  {vpsPlan?.pricing?.find(p => p.period === 1)?.offerPrice
                    ? formatValue(
                        vpsPlan?.pricing?.find(p => p.period === 1)
                          ?.offerPrice as number,
                      )
                    : formatValue(
                        vpsPlan?.pricing?.find(p => p.period === 1)
                          ?.price as number,
                      )}
                </span>
              </div>

              {/* Region Cost */}
              <div className='flex justify-between'>
                <span className='text-cq-text-secondary'>
                  Region:{' '}
                  {vpsPlan?.regionOptions?.find(r => r.regionCode === 'EU')
                    ?.region || 'Europe'}
                </span>
                <span className='text-cq-text'>
                  {vpsPlan?.regionOptions?.find(r => r.regionCode === 'EU')
                    ?.price.type === 'free'
                    ? 'Free'
                    : formatValue(
                        vpsPlan?.regionOptions?.find(r => r.regionCode === 'EU')
                          ?.price.amount as number,
                      )}
                </span>
              </div>

              {/* Divider */}
              <div className='border-cq-text-secondary my-2 border-t'></div>

              {/* Total for selected period */}
              <div className='flex justify-between font-bold'>
                <span className='text-cq-text'>Total (1 month)</span>
                <span className='text-cq-primary text-lg'>
                  {formatValue(
                    (vpsPlan?.pricing?.find(p => p.period === 1)?.offerPrice ||
                      vpsPlan?.pricing?.find(p => p.period === 1)?.price ||
                      0) +
                      (vpsPlan?.regionOptions?.find(r => r.regionCode === 'EU')
                        ?.price.type === 'paid'
                        ? (vpsPlan?.regionOptions?.find(
                            r => r.regionCode === 'EU',
                          )?.price.amount as number)
                        : 0),
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Submit & Cancel Button */}
          <div className='mt-5 flex w-full items-center justify-end space-x-4'>
            <Button
              type='button'
              onClick={handleCancel}
              variant={'outline'}
              size={'default'}
              disabled={isCreatingVpsOrder}>
              Cancel
            </Button>
            <Button
              type='submit'
              size={'default'}
              disabled={isCreatingVpsOrder}
              isLoading={isCreatingVpsOrder}>
              Place Order
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default VpsForm

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
