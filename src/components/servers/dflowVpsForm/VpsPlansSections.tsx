'use client'

import { Server } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useId } from 'react'

import { getDflowUser } from '@/actions/cloud/dFlow'
import { VpsPlan } from '@/actions/cloud/dFlow/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import { useDflowVpsForm } from './DflowVpsFormProvider'

interface VpsPlansSectionProps {
  vpsPlans: VpsPlan[]
  selectedPlan: string
  onPlanChange: (planSlug: string) => void
}

const calculateDiscountedPrice = (
  originalPrice: number,
  walletBalance: number,
) => {
  if (originalPrice <= 0) return { finalPrice: 0, creditsApplied: 0 }

  const creditsApplied = Math.min(walletBalance, originalPrice)
  const finalPrice = Math.max(0, originalPrice - creditsApplied)

  return { finalPrice, creditsApplied }
}

const formatDiscountedPrice = (plan: VpsPlan, walletBalance: number = 0) => {
  const originalPrice = plan.pricing?.[0]?.price || 0

  if (originalPrice === 0) return 'Free'

  const { finalPrice, creditsApplied } = calculateDiscountedPrice(
    originalPrice,
    walletBalance,
  )

  if (finalPrice === 0) return 'Free'
  if (creditsApplied > 0) return `$${finalPrice.toFixed(2)}/month`

  return `$${originalPrice.toFixed(2)}/month`
}

const shouldShowCreditsNote = (plan: VpsPlan, walletBalance: number = 0) => {
  const originalPrice = plan.pricing?.[0]?.price || 0
  if (originalPrice <= 0) return false

  const { creditsApplied } = calculateDiscountedPrice(
    originalPrice,
    walletBalance,
  )
  return creditsApplied > 0
}

const formatSpecs = (plan: VpsPlan) => {
  return `${plan.cpu.cores}C ${plan.cpu.type} • ${plan.ram.size}${plan.ram.unit} RAM • ${plan.storageOptions?.[0]?.size}${plan.storageOptions?.[0]?.unit} ${plan.storageOptions?.[0]?.type}`
}

export const VpsPlansSection: React.FC<VpsPlansSectionProps> = ({
  vpsPlans,
  selectedPlan,
  onPlanChange,
}) => {
  const id = useId()
  const { execute, result } = useAction(getDflowUser)
  const { vpsPlan, pricing, refreshPaymentStatus } = useDflowVpsForm()

  useEffect(() => {
    execute()
  }, [execute])

  const walletBalance = result?.data?.user?.wallet ?? 0

  return (
    <Card className='border shadow-sm'>
      <CardHeader>
        <CardTitle className='text-lg font-medium'>
          Choose Your VPS Plan
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <RadioGroup
          className='grid grid-cols-1 gap-4 md:grid-cols-2'
          value={selectedPlan}
          onValueChange={planSlug => {
            refreshPaymentStatus()
            onPlanChange(planSlug)
          }}>
          {vpsPlans.map(plan => {
            const originalPrice = plan.pricing?.[0]?.price || 0
            const { finalPrice, creditsApplied } = calculateDiscountedPrice(
              originalPrice,
              walletBalance,
            )
            const showCreditsNote = shouldShowCreditsNote(plan, walletBalance)

            return (
              <div
                key={plan.slug}
                className={`relative flex w-full items-start rounded-md border ${
                  selectedPlan === plan.slug
                    ? 'border-2 border-primary'
                    : 'border-input'
                } cursor-pointer p-4 transition-all duration-200 hover:border-primary/50`}>
                <RadioGroupItem
                  value={String(plan.slug)}
                  id={`${id}-${plan.slug}`}
                  className='order-1 after:absolute after:inset-0'
                />
                <div className='flex grow gap-4'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary'>
                    <Server className='size-4' />
                  </div>

                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <Label
                        htmlFor={`${id}-${plan.slug}`}
                        className='cursor-pointer font-medium'>
                        {plan.name}
                      </Label>
                    </div>

                    <p className='text-sm text-muted-foreground'>
                      {formatSpecs(plan)}
                    </p>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-primary'>
                          {formatDiscountedPrice(plan, walletBalance)}
                        </span>
                      </div>
                      {showCreditsNote && (
                        <div className='flex items-center gap-1'>
                          <span className='text-xs font-medium text-green-600'>
                            Credits Applied: -${creditsApplied.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
