import { useDflowVpsForm } from '../DflowVpsFormProvider'
import { formatValue } from '../utils'
import { CheckCircle } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export const TermLengthSection = () => {
  const { control, setValue, watch } = useFormContext()
  const { vpsPlan } = useDflowVpsForm()

  const selectedTerm = watch('pricing.id')

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
            }
            setValue('pricing', newValue, { shouldValidate: true })
          }
        }}
        className='flex w-full flex-col gap-4 sm:flex-row'>
        {vpsPlan?.pricing?.map(plan => (
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
              <div className='text-lg text-foreground'>{`${plan.period} ${plan.period === 1 ? 'Month' : 'Months'}`}</div>
              <div className='text-muted-foreground'>
                {Boolean(plan.offerPrice) ? (
                  <div>
                    <span className='line-through'>{`${formatValue(plan.price)} / month`}</span>
                    <span>{` ${formatValue(plan.offerPrice as number)} / month`}</span>
                  </div>
                ) : (
                  <div>{`${formatValue(plan.price)} / month`}</div>
                )}
              </div>
            </label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
