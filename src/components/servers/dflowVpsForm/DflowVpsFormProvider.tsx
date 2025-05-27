'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { createContext, useContext, useEffect, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { VpsPlan } from '@/actions/cloud/dFlow/types'
import { SshKey } from '@/payload-types'

import { dflowVpsSchema } from './schemas'
import { handleGenerateName } from './utils'

// Define types for pricing components based on actual data structure
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

type PricingData = {
  selectedPricing: PricingOption | undefined
  selectedRegion: RegionOption | undefined
  selectedStorage: StorageOption | undefined
  selectedImage: ImageOption | undefined
  selectedBackup: BackupOption | undefined
  calculateTotalCost: () => number
  planCost: number
}

type DflowVpsFormContextType = {
  vpsPlan: VpsPlan
  sshKeys: SshKey[]
  selectedAccountId: string
  onAccountChange: (accountId: string) => void
  pricing: PricingData
}

const DflowVpsFormContext = createContext<DflowVpsFormContextType | null>(null)

export const DflowVpsFormProvider = ({
  children,
  vpsPlan,
  selectedAccountId,
  onAccountChange,
  sshKeys,
}: {
  children: React.ReactNode
  vpsPlan: VpsPlan
  selectedAccountId: string
  onAccountChange: (accountId: string) => void
  sshKeys: SshKey[]
}) => {
  const methods = useForm<z.infer<typeof dflowVpsSchema>>({
    resolver: zodResolver(dflowVpsSchema),
    defaultValues: {
      login: {
        rootPassword: 141086,
      },
    },
    mode: 'all',
  })

  const { setValue, watch } = methods

  // Watch form values for pricing calculations
  const selectedTerm = watch('pricing')
  const selectedImageId = watch('image.imageId')
  const selectedImageVersionId = watch('image.versionId')

  // Calculate pricing data with proper typing
  const pricing = useMemo((): PricingData => {
    const selectedPricing = vpsPlan?.pricing?.find(
      p => p.id === watch('pricing.id'),
    )

    const selectedImage = vpsPlan?.images?.find(
      image => image.id === selectedImageId,
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

    const calculateTotalCost = (): number => {
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

    return {
      selectedPricing,
      selectedRegion,
      selectedStorage,
      selectedImage,
      selectedBackup,
      calculateTotalCost,
      planCost,
    }
  }, [
    vpsPlan,
    sshKeys,
    watch('pricing.id'),
    watch('region.name'),
    watch('storageType.productId'),
    watch('backup.id'),
    selectedImageId,
    selectedImageVersionId,
  ])

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

      const displayName = handleGenerateName()

      setValue('displayName', displayName, { shouldValidate: true })

      setValue(
        'pricing',
        {
          id: selectedPricing?.id || vpsPlan?.pricing?.at(0)?.id || '',
          priceId:
            selectedPricing?.stripePriceId ||
            vpsPlan?.pricing?.at(0)?.stripePriceId ||
            '',
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
      setValue(
        'image',
        {
          imageId: vpsPlan?.images?.at(0)?.id || '',
          versionId: vpsPlan?.images?.at(0)?.versions?.at(0)?.imageId || '',
          priceId: vpsPlan?.images?.at(0)?.versions?.at(0)?.stripePriceId || '',
        },
        { shouldValidate: true },
      )
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

    setValue('login.rootPassword', 141086, { shouldValidate: true })
  }, [vpsPlan, setValue])

  return (
    <FormProvider {...methods}>
      <DflowVpsFormContext.Provider
        value={{
          vpsPlan,
          sshKeys,
          selectedAccountId,
          onAccountChange,
          pricing,
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
