import { useDflowVpsForm } from '../DflowVpsFormProvider'
import { formatValue } from '../utils'
import { CheckCircle } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export const ImageSelection = () => {
  const form = useFormContext()
  const { vpsPlan } = useDflowVpsForm()

  const selectedImageId = form.watch('image.imageId')

  return (
    <div className='mb-6'>
      <h2 className='mb-3 text-lg font-semibold text-foreground'>
        Image <span className='text-destructive'>*</span>
      </h2>
      <RadioGroup
        value={selectedImageId}
        onValueChange={value => {
          const selectedImage = vpsPlan?.images?.find(i => i.id === value)
          if (selectedImage && selectedImage.versions?.length) {
            form.setValue(
              'image',
              {
                imageId: selectedImage.id as string,
                versionId: selectedImage.versions[0].imageId,
                priceId: selectedImage.versions[0].stripePriceId || '',
              },
              { shouldValidate: true },
            )
          }
        }}
        className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {vpsPlan?.images?.map(image => {
          const selectedVersion = image.versions?.find(
            version => version.imageId === form.watch('image.versionId'),
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
              />
              <label
                htmlFor={`image-${image.id}`}
                className={`flex h-full w-full cursor-pointer flex-col rounded-lg p-4 transition-all duration-300 ease-in-out ${
                  selectedImageId === image.id
                    ? 'border-2 border-primary bg-secondary/10'
                    : 'border-2 border-transparent bg-secondary/5'
                }`}>
                <div className='text-lg text-foreground'>{image.label}</div>
                <div className='text-muted-foreground'>
                  {selectedVersion?.label || 'Latest'}
                </div>
                <div className='mt-2 text-primary'>
                  {selectedVersion?.price.type === 'included'
                    ? 'Included'
                    : formatValue(selectedVersion?.price.amount as number)}
                </div>
              </label>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}
