import { useDflowVpsForm } from '../DflowVpsFormProvider'
import { formatValue } from '../utils'
import { CheckCircle } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import { getDflowUser } from '@/actions/cloud/dFlow'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export const TermLengthSection = () => {
  const { control, setValue, watch } = useFormContext()
  const { vpsPlan } = useDflowVpsForm()

  const selectedTerm = watch('pricing.id')

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
      <RadioGroup
        value={selectedTerm}
        onValueChange={value => {
          const selectedPlan = vpsPlan?.pricing?.find(p => p.id === value)

          if (selectedPlan) {
            const newValue = {
              id: selectedPlan.id as string,
              priceId: selectedPlan.stripePriceId || '',
              termLength: selectedPlan.period,
            }
            setValue('pricing', newValue, { shouldValidate: true })
          }
        }}
        className='flex w-full flex-col gap-4 sm:flex-row'>
        {vpsPlan?.pricing?.map(plan => {
          const basePrice = plan.offerPrice ?? plan.price
          const totalPrice = basePrice * plan.period
          const creditsApplied = Math.min(walletBalance, totalPrice)
          const finalPrice = totalPrice - creditsApplied

          return (
            <div
              key={plan.id}
              className={`relative flex-1 transition-transform duration-300 ${
                plan.id === selectedTerm ? 'scale-100' : 'scale-95'
              }`}>
              <RadioGroupItem
                value={plan.id as string}
                id={`pricing-${plan.id}`}
                className='hidden h-4 w-4'
              />
              {plan.id === selectedTerm && (
                <CheckCircle
                  className='absolute right-4 top-3 text-primary'
                  size={20}
                />
              )}
              <label
                htmlFor={`pricing-${plan.id}`}
                className={`block w-full cursor-pointer rounded-lg p-4 transition-all duration-300 ease-in-out ${
                  plan.id === selectedTerm
                    ? 'border-2 border-primary bg-secondary/10'
                    : 'border-2 border-transparent bg-secondary/5'
                }`}>
                <div className='text-lg text-foreground'>
                  {plan.period} {plan.period === 1 ? 'Month' : 'Months'}
                </div>

                <div className='text-muted-foreground'>
                  {finalPrice === 0 ? (
                    <div className='font-semibold text-primary'>Free</div>
                  ) : (
                    <div className='font-medium'>
                      {formatValue(finalPrice)} /month
                    </div>
                  )}
                  {creditsApplied > 0 && (
                    <div className='text-xs text-green-500'>
                      Credits Applied: {formatValue(creditsApplied)}
                    </div>
                  )}
                </div>
              </label>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}
