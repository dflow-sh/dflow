'use client'

import Loader from '../Loader'
import { Button } from '../ui/button'
import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { skipOnboardingAction } from '@/actions/gitProviders'

const SkipButton = () => {
  const router = useRouter()

  const { execute, isPending } = useAction(skipOnboardingAction, {
    onSuccess: ({ data }: { data?: { success: boolean } }) => {
      if (data?.success) {
        router.push('/dashboard')
      }
    },
    onError: () => {
      toast.error('Failed to skip onboarding')
    },
  })

  return (
    <Button
      variant={'secondary'}
      onClick={() => execute()}
      disabled={isPending}>
      {isPending ? <Loader className='h-fit w-fit' /> : 'Skip'}
    </Button>
  )
}

export default SkipButton
