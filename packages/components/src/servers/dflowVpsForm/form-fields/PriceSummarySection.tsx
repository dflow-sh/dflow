'use client'

import { useDflowVpsForm } from '../DflowVpsFormProvider'
import { formatValue } from '../utils'
import { useAction } from 'next-safe-action/hooks'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import { getDflowUser } from '@dflow/actions/cloud/dFlow'
import { Separator } from '@dflow/components/ui/separator'

export const PriceSummarySection = () => {
  const { vpsPlan, pricing } = useDflowVpsForm()
  const form = useFormContext()
  const { execute, result } = useAction(getDflowUser)

  useEffect(() => {
    execute()
  }, [])

  const {
    selectedPricing,
    selectedRegion,
    selectedStorage,
    selectedImage,
    selectedBackup,
    planCost,
    selectedLicense,
  } = pricing

  const selectedImageVersionId = form.watch('image.versionId')
  // console.log({ result })
  // Wallet logic
  const walletBalance = result?.data?.user?.wallet || 0
  const walletUsed = Math.min(walletBalance, planCost)
  const finalCost = Math.max(planCost - walletBalance, 0)

  return (
    <div className='mb-6'>
      <h2 className='text-foreground mb-3 text-lg font-semibold'>
        Price Summary
      </h2>

      <div className='border-border rounded-lg border pt-4'>
        <div className='space-y-4 px-4'>
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

          {selectedLicense && (
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>
                License: {selectedLicense.label}
              </span>
              <span className='text-foreground'>
                {selectedLicense.price.type === 'included'
                  ? 'Included'
                  : formatValue(selectedLicense.price.amount || 0)}
              </span>
            </div>
          )}

          {walletUsed > 0 && (
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Wallet Credits</span>
              <span className='text-green-600'>
                - {formatValue(walletUsed)}
              </span>
            </div>
          )}
        </div>

        <Separator className='mt-2' />

        <div className='bg-border/50 flex justify-between rounded-b-lg px-4 py-4'>
          <span className='text-foreground font-bold'>
            Total ({selectedPricing?.period || 1} month)
          </span>
          <span className='text-primary text-lg'>{formatValue(finalCost)}</span>
        </div>
      </div>
    </div>
  )
}
