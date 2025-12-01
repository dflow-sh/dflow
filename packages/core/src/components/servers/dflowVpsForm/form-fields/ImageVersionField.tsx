import { useDflowVpsForm } from '../DflowVpsFormProvider'
import { formatValue } from '../utils'
import { useFormContext } from 'react-hook-form'

import { Ubuntu, Windows } from '@dflow/core/components/icons'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@dflow/core/components/ui/form'
import { Label } from '@dflow/core/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@dflow/core/components/ui/radio-group'

export const ImageVersionField = () => {
  const { setValue, control, watch, getValues } = useFormContext()
  const { vpsPlan } = useDflowVpsForm()

  const selectedImageId = watch('image.imageId')
  const selectedImage = vpsPlan?.images?.find(i => i.id === selectedImageId)

  if (
    !selectedImage ||
    !selectedImage.versions ||
    !selectedImage.versions.length
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
              <FormLabel className='text-foreground mb-3 text-lg font-semibold'>
                Version <span className='text-destructive'>*</span>
              </FormLabel>

              <FormControl>
                <RadioGroup
                  key={selectedImageId}
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
                  value={field?.value}
                  className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                  {selectedImage.versions?.map(version => {
                    return (
                      <FormItem key={version.imageId}>
                        <FormControl>
                          <div
                            className={`relative flex items-start rounded-md border ${
                              field?.value === version.imageId
                                ? 'border-primary border-2'
                                : 'border-input'
                            } hover:border-primary/50 cursor-pointer p-4 transition-all duration-200`}>
                            <RadioGroupItem
                              value={version.imageId}
                              id={version.imageId}
                              className='order-1 after:absolute after:inset-0'
                            />

                            <div className='flex grow gap-4'>
                              <div className='bg-secondary/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                                {/* <p className='text-xl'>{flagDetails?.flag}</p> */}
                                {version?.label
                                  .toLocaleLowerCase()
                                  .startsWith('windows') ? (
                                  <Windows className='size-5' />
                                ) : (
                                  <Ubuntu className='size-5' />
                                )}
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
                                    : `${formatValue(version.price.amount || 0)}`}
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
