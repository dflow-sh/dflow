import { useDflowVpsForm } from '../DflowVpsFormProvider'
import { formatValue } from '../utils'
import { useFormContext } from 'react-hook-form'

import { Ubuntu } from '@/components/icons'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export const ImageVersionField = () => {
  const { setValue, control, watch, getValues } = useFormContext()
  const { vpsPlan } = useDflowVpsForm()

  const selectedImageId = watch('image.imageId')
  const selectedImage = vpsPlan?.images?.find(i => i.id === selectedImageId)

  if (
    !selectedImage ||
    !selectedImage.versions ||
    selectedImage.versions.length <= 1
  ) {
    return null
  }

  return (
    <div className='mb-6'>
      <FormField
        control={control}
        name='image.versionId'
        render={({ field }) => {
          return (
            <FormItem>
              <FormLabel className='mb-3 text-lg font-semibold text-foreground'>
                Image Version <span className='text-destructive'>*</span>
              </FormLabel>

              <FormControl>
                <RadioGroup
                  onValueChange={value => {
                    const selectedVersion = selectedImage.versions?.find(
                      v => v.imageId === value,
                    )
                    if (selectedVersion) {
                      setValue(
                        'image',
                        {
                          ...getValues('image'),
                          versionId: selectedVersion.imageId,
                          priceId: selectedVersion.stripePriceId || '',
                        },
                        { shouldValidate: true },
                      )
                    }
                  }}
                  defaultValue={field?.value}
                  className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                  {selectedImage.versions?.map(version => {
                    return (
                      <FormItem key={version.imageId}>
                        <FormControl>
                          <div
                            className={`relative flex items-start rounded-md border ${
                              field?.value === version.imageId
                                ? 'border-2 border-primary'
                                : 'border-input'
                            } cursor-pointer p-4 transition-all duration-200 hover:border-primary/50`}>
                            <RadioGroupItem
                              value={version.imageId}
                              id={version.imageId}
                              className='order-1 after:absolute after:inset-0'
                            />

                            <div className='flex grow gap-4'>
                              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50'>
                                {/* <p className='text-xl'>{flagDetails?.flag}</p> */}
                                <Ubuntu className='size-5' />
                              </div>

                              <div>
                                <Label
                                  htmlFor={version.imageId}
                                  className='cursor-pointer font-medium'>
                                  {version.label}
                                </Label>

                                <p className='font-semibold'>
                                  {version.price.type === 'included'
                                    ? 'Free'
                                    : `(${formatValue(version.price.amount || 0)})`}
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
    </div>
  )
}
