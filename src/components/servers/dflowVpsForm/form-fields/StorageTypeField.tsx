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

export const StorageTypeField = () => {
  const { vpsPlan } = useDflowVpsForm()
  const form = useFormContext()

  return (
    <div className='mb-6'>
      <FormField
        control={form.control}
        name='storageType.productId'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Storage Type <span className='text-destructive'>*</span>
            </FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={value => {
                  const selectedStorage = vpsPlan?.storageOptions?.find(
                    s => s.productId === value,
                  )
                  if (selectedStorage) {
                    form.setValue(
                      'storageType',
                      {
                        productId: selectedStorage.productId,
                        priceId: selectedStorage.stripePriceId || '',
                      },
                      { shouldValidate: true },
                    )
                  }
                }}>
                <SelectTrigger className='bg-background'>
                  <SelectValue placeholder='Select storage type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Storage Types</SelectLabel>
                    {vpsPlan?.storageOptions?.map(storage => (
                      <SelectItem
                        key={storage.productId}
                        value={storage.productId}>
                        {storage.size} {storage.unit} {storage.type}{' '}
                        {storage.price.type === 'free'
                          ? '(Free)'
                          : `(${formatValue(storage.price.amount || 0)})`}
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
