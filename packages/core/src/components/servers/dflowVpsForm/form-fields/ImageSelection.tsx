import { useDflowVpsForm } from '../DflowVpsFormProvider'
import { VpsFormData } from '../schemas'
import { HardDrive } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import { CPanel, Plesk, Ubuntu, Windows } from '@dflow/core/components/icons'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@dflow/core/components/ui/form'
import { Label } from '@dflow/core/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@dflow/core/components/ui/radio-group'

const icons = {
  ubuntu: Ubuntu,
  plesk: Plesk,
  cpanel: CPanel,
  windows: Windows,
}

type Icon = keyof typeof icons

export const ImageSelection = () => {
  const { control, setValue } = useFormContext<VpsFormData>()
  const { vpsPlan } = useDflowVpsForm()

  return (
    <FormField
      control={control}
      name='image.imageId'
      render={({ field }) => {
        return (
          <FormItem className='mb-6'>
            <FormLabel className='text-foreground mb-3 text-lg font-semibold'>
              Image <span className='text-destructive'>*</span>
            </FormLabel>

            <FormControl>
              <RadioGroup
                onValueChange={value => {
                  if (vpsPlan) {
                    const firstImage = vpsPlan.images?.find(
                      image => image.id === value,
                    )

                    setValue('image.imageId', value, {
                      shouldValidate: true,
                    })

                    setValue('imageType', firstImage?.category!, {
                      shouldValidate: true,
                    })

                    if (firstImage?.category !== 'panels') {
                      setValue('license', undefined)
                    }

                    setValue('image', {
                      imageId: firstImage?.id!,
                      versionId: firstImage?.versions?.at(0)?.imageId || '',
                      priceId: firstImage?.versions?.at(0)?.stripePriceId || '',
                    })

                    // Setting first license if type is panel
                    if (firstImage?.category === 'panels') {
                      setValue('license', {
                        licenseCode:
                          firstImage?.licenses?.at(0)?.licenseCode || '',
                        priceId:
                          firstImage?.licenses?.at(0)?.stripePriceId || '',
                      })
                    }
                  }
                }}
                value={field?.value}
                className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {vpsPlan?.images?.map(image => {
                  const name = image.name.toLowerCase() as Icon
                  const ImageIcon = icons[name]

                  // Hiding panel images from this selection
                  if (image.name !== 'ubuntu') {
                    return null
                  }

                  return (
                    <FormItem key={image.id}>
                      <FormControl>
                        <div
                          className={`relative flex items-start rounded-md border ${
                            field?.value === image.id
                              ? 'border-primary border-2'
                              : 'border-input'
                          } hover:border-primary/50 cursor-pointer p-4 transition-all duration-200`}>
                          <RadioGroupItem
                            value={image.id!}
                            id={image.id!}
                            className='order-1 after:absolute after:inset-0'
                          />

                          <div className='flex grow gap-4'>
                            <div className='bg-secondary/50 flex h-10 w-10 items-center justify-center rounded-full'>
                              {ImageIcon ? (
                                <ImageIcon className='text-foreground size-5' />
                              ) : (
                                <HardDrive className='text-foreground size-5' />
                              )}
                            </div>

                            <div>
                              <Label
                                htmlFor={image.id!}
                                className='cursor-pointer font-medium'>
                                {image.label}
                              </Label>
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
