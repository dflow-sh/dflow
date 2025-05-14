'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Camera,
  CheckCircle,
  CircuitBoard,
  Cpu,
  HardDrive,
  Key,
  Network,
} from 'lucide-react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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

  const form = useForm<VpsFormData>({
    resolver: zodResolver(vpsSchema),
    defaultValues: {
      login: {
        rootPassword: 141086,
      },
    },
    mode: 'all', // Enable real-time validation
  })

  const formState = form.formState
  const isFormValid = formState.isValid
  const formErrors = Object.keys(formState.errors).length > 0

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

      form.setValue('displayName', displayName)
      form.setValue('pricing', {
        id: selectedPricing?.id || vpsPlan?.pricing?.at(0)?.id || '',
        priceId:
          selectedPricing?.stripePriceId ||
          vpsPlan?.pricing?.at(0)?.stripePriceId ||
          '',
      })
      form.setValue('region', {
        name:
          freeRegion?.regionCode ||
          vpsPlan?.regionOptions?.at(0)?.regionCode ||
          '',
        priceId:
          freeRegion?.stripePriceId ||
          vpsPlan?.regionOptions?.at(0)?.stripePriceId ||
          '',
      })
      form.setValue('storageType', {
        productId: freeStorageType
          ? freeStorageType?.productId!
          : vpsPlan?.storageOptions?.at(0)?.productId!,
        priceId: freeStorageType
          ? freeStorageType?.stripePriceId
          : vpsPlan?.storageOptions?.at(0)?.stripePriceId!,
      })
      form.setValue('image', {
        imageId: vpsPlan?.images?.at(0)?.id || '',
        versionId: vpsPlan?.images?.at(0)?.versions?.at(0)?.imageId || '',
        priceId: vpsPlan?.images?.at(0)?.versions?.at(0)?.stripePriceId || '',
      })
      form.setValue('backup', {
        id: freeBackup?.id || vpsPlan?.backupOptions?.at(0)?.id || '',
        priceId:
          freeBackup?.stripePriceId ||
          vpsPlan?.backupOptions?.at(0)?.stripePriceId ||
          '',
      })
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
          privateSshKey: data.login.sshKey.privateKey,
        },
      ],
      vps: {
        name: data.displayName,
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
        <Badge className='bg-primary text-primary-foreground'>
          1 Month Free
        </Badge>
      </div>
      <div>
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
                    ?.filter(s => s.price.type === 'free')
                    .map(s => `${s.size} ${s.type}`)
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
            {/* Form Errors Summary */}
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
                        disabled={true}
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
                disabled={true}
                className='flex w-full flex-col gap-4 sm:flex-row'>
                {vpsPlan?.pricing?.map(plan => (
                  <div
                    key={plan.id}
                    className={`relative flex-1 transition-transform duration-300 ${
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
                        className='absolute right-4 top-3 text-primary'
                        size={20}
                      />
                    )}
                    <label
                      htmlFor={`pricing-${plan.id}`}
                      className={`block w-full cursor-not-allowed rounded-lg p-4 transition-all duration-300 ease-in-out ${
                        plan.period === 1
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
                      <Select disabled value='EU'>
                        <SelectTrigger className='bg-background'>
                          <SelectValue>
                            {vpsPlan?.regionOptions?.find(
                              r => r.regionCode === 'EU',
                            )?.region || 'Europe'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Region is pre-selected</SelectLabel>
                            <SelectItem value='EU'>Europe</SelectItem>
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
                      <Select disabled value='V92'>
                        <SelectTrigger className='bg-background'>
                          <SelectValue>
                            {vpsPlan?.storageOptions?.find(
                              s => s.productId === 'V92',
                            )?.size || '40'}{' '}
                            GB SSD
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>
                              Storage type is pre-selected
                            </SelectLabel>
                            <SelectItem value='V92'>40 GB SSD</SelectItem>
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
                disabled={true}
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
                        disabled
                      />
                      <label
                        htmlFor={`image-${image.id}`}
                        className={`flex h-full w-full cursor-not-allowed flex-col rounded-lg p-4 transition-all duration-300 ease-in-out ${
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
                          disabled
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
                          disabled
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
                          disabled
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
                  disabled={true}
                  className='flex flex-col gap-4 sm:flex-row'>
                  {vpsPlan?.backupOptions?.map(backupOption => {
                    const isSelected = backupOption.price.type === 'included'

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
                          disabled
                        />
                        <label
                          htmlFor={`backup-${backupOption.id}`}
                          className={`block h-full w-full cursor-not-allowed rounded-lg transition-all duration-300 ease-in-out ${
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
                              <strong>Frequency:</strong>{' '}
                              {backupOption.frequency}
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
                              : 'Free'}
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
                    {vpsPlan?.name} (1 Month)
                  </span>
                  <span className='text-foreground'>
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

                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    Region:{' '}
                    {vpsPlan?.regionOptions?.find(r => r.regionCode === 'EU')
                      ?.region || 'Europe'}
                  </span>
                  <span className='text-foreground'>
                    {vpsPlan?.regionOptions?.find(r => r.regionCode === 'EU')
                      ?.price.type === 'free'
                      ? 'Free'
                      : formatValue(
                          vpsPlan?.regionOptions?.find(
                            r => r.regionCode === 'EU',
                          )?.price.amount as number,
                        )}
                  </span>
                </div>

                <Separator className='my-2' />

                <div className='flex justify-between'>
                  <span className='font-bold text-foreground'>
                    Total (1 month)
                  </span>
                  <span className='text-lg text-primary line-through'>
                    {formatValue(
                      (vpsPlan?.pricing?.find(p => p.period === 1)
                        ?.offerPrice ||
                        vpsPlan?.pricing?.find(p => p.period === 1)?.price ||
                        0) +
                        (vpsPlan?.regionOptions?.find(
                          r => r.regionCode === 'EU',
                        )?.price.type === 'paid'
                          ? (vpsPlan?.regionOptions?.find(
                              r => r.regionCode === 'EU',
                            )?.price.amount as number)
                          : 0),
                    )}
                  </span>
                </div>

                <Card className='border-[#2b4623] bg-[#1a2b14] text-[#4ade80]'>
                  <CardContent className='p-4'>
                    <p className='font-medium'>
                      dFlow Cloud is providing 20 free credits which will be
                      used for 1 month free server!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className='flex justify-end space-x-4'>
              <Button
                type='submit'
                disabled={isCreatingVpsOrder}
                className='bg-primary text-primary-foreground hover:bg-primary/90'>
                {isCreatingVpsOrder ? 'Creating...' : 'Place Order'}
              </Button>
            </div>
          </form>
        </Form>
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
