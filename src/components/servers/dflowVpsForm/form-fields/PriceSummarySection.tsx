'use client'

import { useDflowVpsForm } from '../DflowVpsFormProvider'
import { formatValue } from '../utils'
import { useFormContext } from 'react-hook-form'

import { Separator } from '@/components/ui/separator'

export const PriceSummarySection = () => {
  const { vpsPlan, pricing } = useDflowVpsForm()
  const form = useFormContext()

  const {
    selectedPricing,
    selectedRegion,
    selectedStorage,
    selectedImage,
    selectedBackup,
    planCost,
  } = pricing

  const selectedImageVersionId = form.watch('image.versionId')

  return (
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
          <span className='text-lg text-primary'>{formatValue(planCost)}</span>
        </div>
      </div>
    </div>
  )
}
