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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const ImageVersionField = () => {
  const form = useFormContext()
  const { vpsPlan } = useDflowVpsForm()

  const selectedImageId = form.watch('image.imageId')
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
        control={form.control}
        name='image.versionId'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Image Version <span className='text-destructive'>*</span>
            </FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={value => {
                  const selectedVersion = selectedImage.versions?.find(
                    v => v.imageId === value,
                  )
                  if (selectedVersion) {
                    form.setValue(
                      'image',
                      {
                        ...form.getValues('image'),
                        versionId: selectedVersion.imageId,
                        priceId: selectedVersion.stripePriceId || '',
                      },
                      { shouldValidate: true },
                    )
                  }
                }}>
                <SelectTrigger className='bg-background'>
                  <SelectValue placeholder='Select image version' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Versions</SelectLabel>
                    {selectedImage.versions?.map(version => (
                      <SelectItem key={version.imageId} value={version.imageId}>
                        {version.label}{' '}
                        {version.price.type === 'included'
                          ? '(Included)'
                          : `(${formatValue(version.price.amount || 0)})`}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
