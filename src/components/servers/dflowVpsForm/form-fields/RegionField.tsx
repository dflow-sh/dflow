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

export const RegionField = () => {
  const { control, setValue, watch } = useFormContext()
  const { vpsPlan } = useDflowVpsForm()

  return (
    <div className='mb-6'>
      <FormField
        control={control}
        name='region.name'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Region <span className='text-destructive'>*</span>
            </FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={value => {
                  const selectedRegion = vpsPlan?.regionOptions?.find(
                    r => r.regionCode === value,
                  )
                  if (selectedRegion) {
                    setValue(
                      'region',
                      {
                        name: selectedRegion.regionCode,
                        priceId: selectedRegion.stripePriceId || '',
                      },
                      { shouldValidate: true },
                    )
                  }
                }}>
                <SelectTrigger className='bg-background'>
                  <SelectValue placeholder='Select region' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Regions</SelectLabel>
                    {vpsPlan?.regionOptions?.map(region => (
                      <SelectItem
                        key={region.regionCode}
                        value={region.regionCode}>
                        {region.region}{' '}
                        {region.price.type === 'free'
                          ? '(Free)'
                          : `(${formatValue(region.price.amount || 0)})`}
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
