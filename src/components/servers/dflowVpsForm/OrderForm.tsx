import { Loader2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useRouter, useSearchParams } from 'next/navigation'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

import { createSshKeysAndVpsAction } from '@/actions/cloud/dFlow'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'

import { useDflowVpsForm } from './DflowVpsFormProvider'
import { BackupOptionsSection } from './form-fields/BackupOptionsSection'
import { DisplayNameField } from './form-fields/DisplayNameField'
import { ImageSelection } from './form-fields/ImageSelection'
import { ImageVersionField } from './form-fields/ImageVersionField'
import { LoginDetailsSection } from './form-fields/LoginDetailsSection'
import { PriceSummarySection } from './form-fields/PriceSummarySection'
import { RegionField } from './form-fields/RegionField'
import { SshKeySection } from './form-fields/SshKeySection'
import { StorageTypeField } from './form-fields/StorageTypeField'
import { TermLengthSection } from './form-fields/TermLengthSection'
import type { VpsFormData } from './schemas'

export const OrderForm = ({ dFlowUser }: { dFlowUser: any }) => {
  const form = useFormContext<VpsFormData>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { pricing, selectedAccount, vpsPlan } = useDflowVpsForm()

  const {
    execute: executeCreateSshKeysAndVpsAction,
    isPending: isCreatingVpsOrder,
    hasSucceeded: triggeredVPSOrderCreation,
  } = useAction(createSshKeysAndVpsAction, {
    onError: () => {
      toast.error('Failed to create server instance, try again')
    },
  })

  const isFormValid = form.formState.isValid
  const formErrors = Object.keys(form.formState.errors).length > 0

  const handleCancel = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('type')
    params.delete('option')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const onSubmit: SubmitHandler<VpsFormData> = data => {
    if (!isFormValid) return

    executeCreateSshKeysAndVpsAction({
      accountId: selectedAccount.id,
      sshKeyIds: data.login.sshKeyIds,
      vps: {
        plan: vpsPlan.id,
        displayName: data.displayName,
        image: {
          imageId: data.image.versionId,
          priceId: data.image.priceId,
        },
        product: {
          productId: data.storageType.productId,
          priceId: data.storageType.priceId,
        },
        region: {
          code: data.region.name,
          priceId: data.region.priceId,
        },
        defaultUser: data.login.username || 'root',
        rootPassword: data.login.rootPassword || 141086,
        period: {
          months: data.pricing.termLength,
          priceId: data.pricing.priceId,
        },
        addOns: {
          ...(data.backup &&
          data.backup.priceId &&
          vpsPlan?.backupOptions?.find(
            backup => backup?.id === data?.backup?.id,
          )?.type !== 'none'
            ? { backup: {}, priceId: data.backup.priceId }
            : {}),
        },
        estimatedCost: pricing.planCost,
      },
    })
  }

  const onboardingCompleted =
    !!dFlowUser?.discord?.accountId && !!dFlowUser?.acceptedTermsDate

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {formErrors && (
            <Alert variant='destructive' className='mb-6'>
              <AlertDescription>
                Please fix the errors in the form before submitting.
              </AlertDescription>
            </Alert>
          )}

          <DisplayNameField />
          <TermLengthSection />
          <RegionField />
          <StorageTypeField />
          <ImageSelection />
          <ImageVersionField />
          <LoginDetailsSection />
          <SshKeySection />
          <BackupOptionsSection />
          <PriceSummarySection />

          {!onboardingCompleted && (
            <Alert variant='warning'>
              <AlertTitle>Onboarding not completed!</AlertTitle>
              <AlertDescription>
                Please complete onboarding process for using our services,
                attach Discord account & accept our Terms of Service{' '}
                <a
                  className='inline-block text-foreground underline'
                  href='https://dflow.sh/dashboard?onboarding=true'
                  rel='no-referrer no-opener'
                  target='_blank'>
                  link
                </a>
              </AlertDescription>
            </Alert>
          )}

          <div className='flex justify-end space-x-4'>
            <Button type='button' variant='outline' onClick={handleCancel}>
              Cancel
            </Button>

            <Button
              type='submit'
              isLoading={isCreatingVpsOrder}
              disabled={
                isCreatingVpsOrder ||
                !pricing.paymentStatus.canProceed ||
                !onboardingCompleted
              }
              className='bg-primary text-primary-foreground hover:bg-primary/90'>
              Place Order
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={triggeredVPSOrderCreation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Processing Your Order</DialogTitle>
            <DialogDescription>
              Your VPS order is being placed. Please wait we'll redirect once
              server is assigned...
            </DialogDescription>
          </DialogHeader>

          <div className='flex items-center justify-center pt-4'>
            <Loader2 className='h-10 w-10 animate-spin text-primary' />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
