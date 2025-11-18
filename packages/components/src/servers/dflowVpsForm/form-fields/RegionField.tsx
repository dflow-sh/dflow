import { useDflowVpsForm } from '../DflowVpsFormProvider'
import { VpsFormData } from '../schemas'
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

const flags = [
  {
    region: 'European Union',
    regionCode: 'EU',
    flag: '🇪🇺',
  },
  {
    region: 'United States (Central)',
    regionCode: 'US-central',
    flag: '🇺🇸',
  },
  {
    region: 'United Kingdom',
    regionCode: 'UK',
    flag: '🇬🇧',
  },
  {
    region: 'United States (East)',
    regionCode: 'US-east',
    flag: '🇺🇸',
  },
  {
    region: 'United States (West)',
    regionCode: 'US-west',
    flag: '🇺🇸',
  },
  {
    region: 'Asia (Singapore)',
    regionCode: 'SIN',
    flag: '🇸🇬',
  },
  {
    region: 'Asia (Japan)',
    regionCode: 'JPN',
    flag: '🇯🇵',
  },
  {
    region: 'Asia (India)',
    regionCode: 'IND',
    flag: '🇮🇳',
  },
  {
    region: 'Australia (Sydney)',
    regionCode: 'AUS',
    flag: '🇦🇺',
  },
]

export const RegionField = () => {
  const { control, setValue } = useFormContext<VpsFormData>()
  const { vpsPlan } = useDflowVpsForm()

  return (
    <div className='mb-6'>
      <FormField
        control={control}
        name='region.name'
        render={({ field }) => {
          return (
            <FormItem>
              <FormLabel className='mb-3 text-lg font-semibold text-foreground'>
                Region <span className='text-destructive'>*</span>
              </FormLabel>

              <FormControl>
                <RadioGroup
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
                  }}
                  value={field?.value}
                  className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                  {vpsPlan?.regionOptions?.map(region => {
                    const flagDetails = flags.find(
                      flag => flag.regionCode === region.regionCode,
                    )

                    return (
                      <FormItem key={region.regionCode}>
                        <FormControl>
                          <div
                            className={`relative flex items-start rounded-md border ${
                              field?.value === region.regionCode
                                ? 'border-2 border-primary'
                                : 'border-input'
                            } cursor-pointer p-4 transition-all duration-200 hover:border-primary/50`}>
                            <RadioGroupItem
                              value={region.regionCode}
                              id={region.regionCode}
                              className='order-1 after:absolute after:inset-0'
                            />

                            <div className='flex grow gap-4'>
                              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50'>
                                <p className='text-xl'>{flagDetails?.flag}</p>
                              </div>

                              <div>
                                <Label
                                  htmlFor={region.regionCode}
                                  className='cursor-pointer font-medium'>
                                  {region.region}
                                </Label>

                                <p className='font-semibold'>
                                  {region.price.type === 'free'
                                    ? 'Free'
                                    : `$ ${region.price.amount}`}
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
