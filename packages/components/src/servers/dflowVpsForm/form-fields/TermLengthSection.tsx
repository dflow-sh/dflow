import { useDflowVpsForm } from '../DflowVpsFormProvider'
import { formatValue } from '../utils'
import { Calendar } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import { getDflowUser } from '@dflow/actions/cloud/dFlow'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@dflow/components/ui/form'
import { Label } from '@dflow/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@dflow/components/ui/radio-group'

export const TermLengthSection = () => {
  const { control, setValue, watch } = useFormContext()
  const { vpsPlan } = useDflowVpsForm()

  const { execute, result } = useAction(getDflowUser)

  useEffect(() => {
    execute()
  }, [])

  const walletBalance = result?.data?.user?.wallet || 0

  return (
    <div className='mb-6'>
      <h2 className='mb-3 text-lg font-semibold text-foreground'>
        Term Length <span className='text-destructive'>*</span>
      </h2>

      <FormField
        control={control}
        name='pricing.id'
        render={({ field }) => {
          return (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={value => {
                    const selectedPlan = vpsPlan?.pricing?.find(
                      p => p.id === value,
                    )

                    if (selectedPlan) {
                      const newValue = {
                        id: selectedPlan.id as string,
                        priceId: selectedPlan.stripePriceId || '',
                        termLength: selectedPlan.period,
                      }
                      setValue('pricing', newValue, { shouldValidate: true })
                    }
                  }}
                  value={field?.value}
                  className='grid sm:grid-cols-2'>
                  {vpsPlan?.pricing?.map(plan => {
                    const basePrice = plan.offerPrice ?? plan.price
                    const totalPrice = basePrice * plan.period
                    const creditsApplied = Math.min(walletBalance, totalPrice)
                    const finalPrice = totalPrice - creditsApplied

                    return (
                      <FormItem key={plan.id}>
                        <FormControl>
                          <div
                            className={`relative flex items-start rounded-md border ${
                              field?.value === plan.id
                                ? 'border-2 border-primary'
                                : 'border-input'
                            } cursor-pointer p-4 transition-all duration-200 hover:border-primary/50`}>
                            <RadioGroupItem
                              value={plan.id ?? ''}
                              id={plan.id ?? ''}
                              className='order-1 after:absolute after:inset-0'
                            />

                            <div className='flex grow gap-4'>
                              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50'>
                                {/* <p className='text-xl'>{flagDetails?.flag}</p> */}
                                <Calendar className='size-5' />
                              </div>

                              <div>
                                <Label
                                  htmlFor={plan.id ?? ''}
                                  className='cursor-pointer font-medium'>
                                  {plan.period}{' '}
                                  {plan.period === 1 ? 'Month' : 'Months'}
                                </Label>

                                <div className='font-semibold'>
                                  {finalPrice === 0 ? (
                                    <div className='font-semibold text-primary'>
                                      Free
                                    </div>
                                  ) : (
                                    <div className='font-medium'>
                                      {formatValue(finalPrice)} /month
                                    </div>
                                  )}
                                  {creditsApplied > 0 && (
                                    <div className='text-xs text-green-500'>
                                      Credits Applied:{' '}
                                      {formatValue(creditsApplied)}
                                    </div>
                                  )}
                                </div>
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
