import { useDflowVpsForm } from '../DflowVpsFormProvider'
import { VpsFormData } from '../schemas'
import { formatValue } from '../utils'
import { HardDrive, RectangleEllipsis } from 'lucide-react'
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

export const StorageTypeField = () => {
  const { vpsPlan } = useDflowVpsForm()
  const { control, setValue } = useFormContext<VpsFormData>()

  return (
    <div className='mb-6'>
      <FormField
        control={control}
        name='storageType.productId'
        render={({ field }) => {
          return (
            <FormItem>
              <FormLabel>
                Storage <span className='text-destructive'>*</span>
              </FormLabel>

              <FormControl>
                <RadioGroup
                  onValueChange={value => {
                    const selectedStorage = vpsPlan?.storageOptions?.find(
                      s => s.productId === value,
                    )
                    if (selectedStorage) {
                      setValue(
                        'storageType',
                        {
                          productId: selectedStorage.productId,
                          priceId: selectedStorage.stripePriceId || '',
                        },
                        { shouldValidate: true },
                      )
                    }
                  }}
                  defaultValue={field?.value}
                  className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                  {vpsPlan?.storageOptions?.map(storage => {
                    return (
                      <FormItem>
                        <FormControl>
                          <div
                            key={storage.productId}
                            className={`relative flex items-start rounded-md border ${
                              field?.value === storage.productId
                                ? 'border-2 border-primary'
                                : 'border-input'
                            } cursor-pointer p-4 transition-all duration-200 hover:border-primary/50`}>
                            <RadioGroupItem
                              value={storage.productId}
                              id={storage.productId}
                              className='order-1 after:absolute after:inset-0'
                            />

                            <div className='flex grow gap-4'>
                              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50'>
                                {storage.type === 'NVMe' ? (
                                  <RectangleEllipsis className='size-4' />
                                ) : (
                                  <HardDrive className='size-4' />
                                )}
                              </div>

                              <div>
                                <Label
                                  htmlFor={storage.productId}
                                  className='cursor-pointer font-medium'>
                                  {`${storage.size} ${storage.unit} ${storage.type}`}
                                </Label>

                                <p className='font-semibold'>
                                  {storage.price.type === 'free'
                                    ? 'Free'
                                    : `${formatValue(storage.price.amount || 0)}`}
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
