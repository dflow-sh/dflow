'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { checkPaymentMethodAction } from '@/actions/cloud/dFlow'
import { VpsPlan } from '@/lib/restSDK/types'
import { SshKey } from '@/payload-types'

import { dflowVpsSchema } from './schemas'
import { handleGenerateName } from './utils'

type PricingOption = {
  id?: string | null
  price: number
  offerPrice?: number | null
  period: number
  stripePriceId: string
}

type RegionOption = {
  regionCode?: string | null
  region?: string | null
  price: {
    type: 'free' | 'paid'
    amount?: number | null
  }
  stripePriceId?: string | null
}

type StorageOption = {
  productId?: string | null
  size?: number | null
  unit?: string | null
  type?: string | null
  price: {
    type: 'free' | 'paid'
    amount?: number | null
  }
  stripePriceId?: string | null
}

type ImageOption = {
  id?: string | null
  label?: string | null
  versions?: Array<{
    imageId?: string | null
    price: {
      type: 'included' | 'paid'
      amount?: number | null
    }
    stripePriceId?: string | null
  }> | null
}

type BackupOption = {
  id?: string | null
  label?: string | null
  price: {
    type: 'included' | 'paid'
    amount?: number | null
  }
  stripePriceId?: string | null
}

type PaymentStatus = {
  canProceed: boolean
  hasWalletBalance: boolean
  hasValidCard: boolean
}

type PricingData = {
  selectedPricing: PricingOption | undefined
  selectedRegion: RegionOption | undefined
  selectedStorage: StorageOption | undefined
  selectedImage: ImageOption | undefined
  selectedBackup: BackupOption | undefined
  selectedLicense: any
  calculateTotalCost: () => number
  planCost: number
  paymentStatus: PaymentStatus
}

type DflowVpsFormContextType = {
  vpsPlan: VpsPlan
  sshKeys: SshKey[]
  selectedAccount: {
    id: string
    token: string
  }
  onAccountChange: Dispatch<
    SetStateAction<{
      id: string
      token: string
    }>
  >
  pricing: PricingData
  refreshPaymentStatus: () => void
  isFetchingPayment: boolean
}

const DflowVpsFormContext = createContext<DflowVpsFormContextType | null>(null)

export const DflowVpsFormProvider = ({
  children,
  vpsPlan,
  selectedAccount,
  onAccountChange,
  sshKeys,
}: {
  children: React.ReactNode
  vpsPlan: VpsPlan
  selectedAccount: {
    id: string
    token: string
  }
  onAccountChange: Dispatch<
    SetStateAction<{
      id: string
      token: string
    }>
  >
  sshKeys: SshKey[]
}) => {
  const methods = useForm<z.infer<typeof dflowVpsSchema>>({
    resolver: zodResolver(dflowVpsSchema),
    defaultValues: {
      login: {
        username: 'root',
        rootPassword: 141086,
      },
    },
    mode: 'all',
  })

  const { setValue, watch } = methods
  const [isFetchingPayment, setIsFetchingPayment] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    canProceed: false,
    hasWalletBalance: false,
    hasValidCard: false,
  })

  const { execute: fetchPaymentData } = useAction(checkPaymentMethodAction, {
    onExecute: () => setIsFetchingPayment(true),
    onSuccess: ({ data }) => {
      const walletBalance = data?.walletBalance || 0
      const validCardCount = data?.validCardCount || 0
      const currentPlanCost = calculateTotalCost()

      setPaymentStatus({
        canProceed: walletBalance >= currentPlanCost || validCardCount > 0,
        hasWalletBalance: walletBalance >= currentPlanCost,
        hasValidCard: validCardCount > 0,
      })
      setIsFetchingPayment(false)
    },
    onError: () => {
      setPaymentStatus({
        canProceed: false,
        hasWalletBalance: false,
        hasValidCard: false,
      })
      setIsFetchingPayment(false)
    },
  })

  const refreshPaymentStatus = () => {
    if (selectedAccount) {
      fetchPaymentData({ token: selectedAccount.token })
    }
  }

  const calculateTotalCost = (): number => {
    const selectedPricing = vpsPlan?.pricing?.find(
      p => p.id === watch('pricing.id'),
    )
    const selectedRegion = vpsPlan?.regionOptions?.find(
      region => region.regionCode === watch('region.name'),
    )
    const selectedImage = vpsPlan?.images?.find(
      image => image.id === watch('image.imageId'),
    )
    const selectedBackup = vpsPlan?.backupOptions?.find(
      backup => backup.id === watch('backup.id'),
    )

    const pricingCost = selectedPricing?.price || 0
    const regionCost =
      selectedRegion?.price.type === 'paid'
        ? selectedRegion.price.amount || 0
        : 0

    const imageCost =
      selectedImage?.versions?.find(v => v.imageId === watch('image.versionId'))
        ?.price.type === 'paid'
        ? selectedImage?.versions?.find(
            v => v.imageId === watch('image.versionId'),
          )?.price.amount || 0
        : 0

    // Adding license pricing
    const selectedLicenseCode = watch('license.licenseCode')
    const selectedImageLicenseObj = selectedImage?.licenses?.find(
      v => v.licenseCode === selectedLicenseCode,
    )

    const licenseCost = (
      selectedImageLicenseObj && selectedImageLicenseObj.price.type === 'paid'
        ? selectedImageLicenseObj.price.amount
        : 0
    ) as number

    const backupCost =
      selectedBackup?.price.type === 'paid'
        ? selectedBackup.price.amount || 0
        : 0

    return pricingCost + regionCost + imageCost + backupCost + licenseCost
  }

  const pricing = useMemo((): PricingData => {
    const selectedPricing = vpsPlan?.pricing?.find(
      p => p.id === watch('pricing.id'),
    )
    const selectedImage = vpsPlan?.images?.find(
      image => image.id === watch('image.imageId'),
    )
    const selectedRegion = vpsPlan?.regionOptions?.find(
      region => region.regionCode === watch('region.name'),
    )
    const selectedStorage = vpsPlan?.storageOptions?.find(
      storage => storage.productId === watch('storageType.productId'),
    )
    const selectedBackup = vpsPlan?.backupOptions?.find(
      backup => backup.id === watch('backup.id'),
    )

    const licenseCode = watch('license.licenseCode')

    const selectedLicense = selectedImage?.licenses?.find(
      license => license.licenseCode === licenseCode,
    )

    const planCost = calculateTotalCost()

    return {
      selectedPricing,
      selectedRegion,
      selectedStorage,
      selectedImage,
      selectedBackup,
      selectedLicense,
      calculateTotalCost,
      planCost,
      paymentStatus,
    }
  }, [
    vpsPlan,
    sshKeys,
    watch('pricing.id'),
    watch('region.name'),
    watch('storageType.productId'),
    watch('backup.id'),
    watch('image.imageId'),
    watch('image.versionId'),
    watch('license.licenseCode'),
    paymentStatus,
  ])

  useEffect(() => {
    refreshPaymentStatus()
  }, [selectedAccount.id])

  useEffect(() => {
    if (vpsPlan) {
      const selectedPricing = vpsPlan.pricing?.at(0)
      const freeRegion = vpsPlan?.regionOptions?.find(
        region => region.price.type === 'free',
      )
      const freeStorageType = vpsPlan?.storageOptions?.find(
        storage => storage.price.type === 'free',
      )
      const freeBackup = vpsPlan?.backupOptions?.find(
        backup => backup.price.type === 'included',
      )

      const displayName = handleGenerateName(3)

      setValue('displayName', displayName, { shouldValidate: true })
      setValue(
        'pricing',
        {
          id: selectedPricing?.id || vpsPlan?.pricing?.at(0)?.id || '',
          priceId:
            selectedPricing?.stripePriceId ||
            vpsPlan?.pricing?.at(0)?.stripePriceId ||
            '',
          termLength:
            selectedPricing?.period || vpsPlan?.pricing?.at(0)?.period || 1,
        },
        { shouldValidate: true },
      )
      setValue(
        'region',
        {
          name:
            freeRegion?.regionCode ||
            vpsPlan?.regionOptions?.at(0)?.regionCode ||
            '',
          priceId:
            freeRegion?.stripePriceId ||
            vpsPlan?.regionOptions?.at(0)?.stripePriceId ||
            '',
        },
        { shouldValidate: true },
      )
      setValue(
        'storageType',
        {
          productId: freeStorageType
            ? (freeStorageType?.productId ?? '')
            : (vpsPlan?.storageOptions?.at(0)?.productId ?? ''),
          priceId: freeStorageType
            ? freeStorageType?.stripePriceId
            : (vpsPlan?.storageOptions?.at(0)?.stripePriceId ?? ''),
        },
        { shouldValidate: true },
      )

      // Selecting first image of plan
      const firstImage = vpsPlan.images?.[0]

      setValue('imageType', firstImage?.category!)

      // Setting first version
      setValue('image', {
        imageId: firstImage?.id!,
        versionId: firstImage?.versions?.at(0)?.imageId || '',
        priceId: firstImage?.versions?.at(0)?.stripePriceId || '',
      })

      // Setting first license if type is panel
      if (firstImage?.category === 'panels') {
        setValue('license', {
          licenseCode: firstImage?.licenses?.at(0)?.licenseCode || '',
          priceId: firstImage?.licenses?.at(0)?.stripePriceId || '',
        })
      }

      setValue(
        'backup',
        {
          id: freeBackup?.id || vpsPlan?.backupOptions?.at(0)?.id || '',
          priceId:
            freeBackup?.stripePriceId ||
            vpsPlan?.backupOptions?.at(0)?.stripePriceId ||
            '',
        },
        { shouldValidate: true },
      )
    }

    setValue('login.username', 'root', { shouldValidate: true })
    setValue('login.rootPassword', 141086, { shouldValidate: true })
  }, [vpsPlan, setValue])

  return (
    <FormProvider {...methods}>
      <DflowVpsFormContext.Provider
        value={{
          vpsPlan,
          sshKeys,
          selectedAccount,
          onAccountChange,
          pricing,
          refreshPaymentStatus,
          isFetchingPayment,
        }}>
        {children}
      </DflowVpsFormContext.Provider>
    </FormProvider>
  )
}

export const useDflowVpsForm = () => {
  const context = useContext(DflowVpsFormContext)

  if (!context) {
    throw new Error(
      'useDflowVpsForm must be used within a DflowVpsFormProvider',
    )
  }

  return context
}
