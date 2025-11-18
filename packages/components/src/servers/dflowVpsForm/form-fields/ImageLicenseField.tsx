import { useDflowVpsForm } from '../DflowVpsFormProvider'
import { VpsFormData } from '../schemas'
import { formatValue } from '../utils'
import { Box } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@dflow/components/ui/form'
import { Label } from '@dflow/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@dflow/components/ui/radio-group'

export const ImageLicenseField = () => {
  const { control, setValue, watch } = useFormContext<VpsFormData>()
  const { vpsPlan } = useDflowVpsForm()

  const selectedImageId = watch('image.imageId')
  const selectedImage = vpsPlan?.images?.find(i => i.id === selectedImageId)

  if (!selectedImage || !selectedImage.licenses?.length) {
    return null
  }

  return (
    <FormField
      control={control}
      name='license.licenseCode'
      render={({ field }) => {
        return (
          <FormItem className='mb-6'>
            <FormLabel className='text-foreground mb-3 text-lg font-semibold'>
              License <span className='text-destructive'>*</span>
            </FormLabel>

            <FormControl>
              <RadioGroup
                key={selectedImageId}
                onValueChange={value => {
                  setValue('license.licenseCode', value)

                  const stripePriceId = selectedImage?.licenses?.find(
                    version => version.licenseCode === value,
                  )?.stripePriceId

                  setValue('license.priceId', stripePriceId!, {
                    shouldValidate: true,
                  })
                }}
                value={field?.value}
                className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {selectedImage?.licenses?.map(license => {
                  return (
                    <FormItem key={license.id}>
                      <FormControl>
                        <div
                          className={`relative flex items-start rounded-md border ${
                            field?.value === license.licenseCode
                              ? 'border-primary border-2'
                              : 'border-input'
                          } hover:border-primary/50 cursor-pointer p-4 transition-all duration-200`}>
                          <RadioGroupItem
                            value={license.licenseCode!}
                            id={license.licenseCode!}
                            className='order-1 after:absolute after:inset-0'
                          />

                          <div className='flex grow gap-4'>
                            <div className='bg-secondary/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                              <Box className='text-foreground size-5' />
                            </div>

                            <div>
                              <Label
                                htmlFor={license.licenseCode!}
                                className='cursor-pointer font-medium'>
                                {license.label}
                              </Label>

                              <p className='font-semibold'>
                                {license.price.type === 'included'
                                  ? 'Free'
                                  : `${formatValue(license.price.amount || 0)}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )
                })}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
