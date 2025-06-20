import { Skeleton } from '../../ui/skeleton'
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  ExternalLink,
  Wallet,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { checkPaymentMethodAction } from '@/actions/cloud/dFlow'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { useDflowVpsForm } from './DflowVpsFormProvider'

export const PaymentStatusSection = () => {
  const form = useFormContext()
  const { selectedAccount, pricing } = useDflowVpsForm()
  const [paymentData, setPaymentData] = useState<{
    walletBalance: number
    validCardCount: number
  } | null>(null)

  // Use pricing data from context
  const { planCost } = pricing

  const { execute: fetchPaymentData, isPending: isFetchingPaymentData } =
    useAction(checkPaymentMethodAction, {
      onSuccess: ({ data }) => {
        setPaymentData({
          walletBalance: data?.walletBalance || 0,
          validCardCount: data?.validCardCount || 0,
        })
      },
      onError: () => {
        setPaymentData(null)
      },
    })

  useEffect(() => {
    if (selectedAccount) {
      fetchPaymentData({ token: selectedAccount.token })
    }
  }, [selectedAccount.id, fetchPaymentData])

  // Payment validation logic using context pricing
  const hasWalletBalance = paymentData
    ? paymentData.walletBalance >= planCost
    : false
  const hasValidCard = paymentData ? paymentData.validCardCount > 0 : false
  const canProceed = hasWalletBalance || hasValidCard

  const walletCreditsApplied = paymentData
    ? Math.min(paymentData.walletBalance, planCost)
    : 0

  const finalPrice = planCost - walletCreditsApplied
  const isCreditsUsed = walletCreditsApplied > 0

  const getPaymentRecommendations = () => {
    const recommendations: React.ReactNode[] = []

    if (!paymentData) return recommendations

    if (hasWalletBalance && hasValidCard) {
      recommendations.push(
        `You can use your wallet balance ($${paymentData.walletBalance.toFixed(2)}) or your saved payment card.`,
      )
    } else if (hasWalletBalance) {
      recommendations.push(
        `You can use your wallet balance ($${paymentData.walletBalance.toFixed(2)}) for this purchase.`,
      )
    } else if (hasValidCard) {
      recommendations.push(
        'Your saved payment card will be charged for this service.',
      )
    } else {
      recommendations.push(
        'You need to add a payment method or top up your wallet to proceed.',
      )
      recommendations.push(
        <span key='required-amount'>
          Required amount: ${planCost.toFixed(2)}
        </span>,
      )
      recommendations.push(
        <Card key='payment-card' className='mt-4'>
          <CardContent className='p-4'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-start gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted'>
                  <CreditCard className='h-5 w-5 text-muted-foreground' />
                </div>
                <div>
                  <p className='font-medium'>Payment Setup Required</p>
                  <div className='mt-1 flex flex-col gap-1 text-sm sm:flex-row sm:items-center'>
                    <span className='text-muted-foreground'>
                      Add a payment method or top up your wallet
                    </span>
                    <span className='hidden text-muted-foreground sm:inline'>
                      •
                    </span>
                    <span className='font-semibold'>
                      ${planCost.toFixed(2)} required
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant='outline'
                size='sm'
                className='w-full gap-2 sm:w-fit'
                onClick={() =>
                  window.open('https://dflow.sh/profile/cards', '_blank')
                }>
                Open dFlow
                <ExternalLink className='h-4 w-4' />
              </Button>
            </div>
          </CardContent>
        </Card>,
      )
    }

    return recommendations
  }

  // Enhanced payment status display with more detailed information
  const getPaymentStatusIcon = () => {
    if (!paymentData) return null

    if (canProceed) {
      return <CheckCircle className='mt-0.5 h-5 w-5 text-green-600' />
    } else {
      return <AlertCircle className='mt-0.5 h-5 w-5 text-yellow-600' />
    }
  }

  const getPaymentStatusVariant = () => {
    if (!paymentData) return 'default'
    return canProceed ? 'default' : 'warning'
  }

  return (
    <div className='space-y-3'>
      {isFetchingPaymentData ? (
        <div className='flex items-center gap-3 rounded-md border p-4'>
          <Skeleton className='h-4 w-4 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-48' />
            <Skeleton className='h-3 w-32' />
          </div>
        </div>
      ) : paymentData ? (
        <Alert variant={getPaymentStatusVariant()}>
          <div className='flex items-start gap-3'>
            {getPaymentStatusIcon()}
            <div className='flex-1 space-y-2'>
              <div className='flex flex-wrap items-center gap-4 text-sm'>
                <div className='flex items-center gap-2'>
                  <Wallet className='h-4 w-4' />
                  <span>Wallet: ${paymentData.walletBalance.toFixed(2)}</span>
                  {hasWalletBalance && (
                    <span className='text-xs text-green-600'>
                      (✓ Sufficient)
                    </span>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <CreditCard className='h-4 w-4' />
                  <span>Cards: {paymentData.validCardCount}</span>
                  {hasValidCard && (
                    <span className='text-xs text-green-600'>
                      (✓ Available)
                    </span>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <span className='font-medium'>
                    Final Price:{' '}
                    {finalPrice === 0 ? (
                      <span className='font-semibold text-green-600'>Free</span>
                    ) : (
                      `$${finalPrice.toFixed(2)}`
                    )}
                  </span>

                  {isCreditsUsed && (
                    <span className='rounded-md bg-primary px-1.5 py-0.5 text-xs'>
                      Credits Applied: -${walletCreditsApplied.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              {getPaymentRecommendations().length > 0 && (
                <AlertDescription className='text-sm'>
                  {getPaymentRecommendations().map((rec, index) => (
                    <div key={index} className='mb-1 last:mb-0'>
                      {rec}
                    </div>
                  ))}
                </AlertDescription>
              )}
            </div>
          </div>
        </Alert>
      ) : (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Unable to fetch payment information. Please check your connection
            and try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
