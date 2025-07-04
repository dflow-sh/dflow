import { useDflowVpsForm } from '../DflowVpsFormProvider'
import { formatValue } from '../utils'
import { useFormContext } from 'react-hook-form'

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

  const versionImages: Record<string, string> = {
    'ubuntu-20.04':
      'https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,w_1200,h_800/https://assets.ubuntu.com/v1/74c5e0ac-hero-img.png',
    'ubuntu-24.04':
      'https://imgs.search.brave.com/7zMz3dzb4y7Gip_Se5_XVn3QbBuW92-XwU0IOpmNqoQ/rs:fit:200:200:1:0/g:ce/aHR0cHM6Ly9hc3Nl/dHMudWJ1bnR1LmNv/bS92MS9jNTQxNGQw/ZS1OdW1iYXQucG5n',
  }

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
                  value={field?.value}
                  className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                  {selectedImage.versions?.map(version => {
                    const bgImage = versionImages[version.version]
                      ? versionImages[version.version]
                      : 'https://imgs.search.brave.com/lTZcTHSHf4vur4qDdVwe_BTryKYrjz24MhSRJKVyhOQ/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy90/aHVtYi85LzllL1Vi/dW50dUNvRi5zdmcv/NjQwcHgtVWJ1bnR1/Q29GLnN2Zy5wbmc'
                    const isSelected = field?.value === version.imageId

                    return (
                      <FormItem key={version.imageId}>
                        <FormControl>
                          <Label
                            htmlFor={version.imageId}
                            className={`relative flex h-40 items-end justify-center overflow-hidden rounded-xl border ${
                              isSelected
                                ? 'border-2 border-primary'
                                : 'border-input'
                            } cursor-pointer transition-all duration-200 hover:border-primary/50`}
                            style={{
                              backgroundImage: `url("${bgImage}")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: 'contain',
                              backgroundPosition: 'center',
                            }}>
                            <RadioGroupItem
                              value={version.imageId}
                              id={version.imageId}
                              className='absolute right-4 top-4 z-10'
                            />
                            {/* Overlay */}
                            <div className='absolute inset-0 z-0 bg-black/70' />

                            {/* Text */}
                            <div className='relative z-10 space-y-2 pb-4 text-center'>
                              <div className='font-medium'>{version.label}</div>
                              <div className='font-semibold'>
                                {version.price.type === 'included'
                                  ? 'Free'
                                  : formatValue(version.price.amount || 0)}
                              </div>
                            </div>
                          </Label>
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
