import { Check } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

import { createVPSOrderAction } from '@/actions/cloud/dFlow'
import Loader from '@/components/Loader'
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
import { DFLOW_CONFIG } from '@/lib/constants'

import { useDflowVpsForm } from './DflowVpsFormProvider'
import { BackupOptionsSection } from './form-fields/BackupOptionsSection'
import { DisplayNameField } from './form-fields/DisplayNameField'
import { ImageLicenseField } from './form-fields/ImageLicenseField'
import { ImageSelection } from './form-fields/ImageSelection'
import { ImageVersionField } from './form-fields/ImageVersionField'
import { PriceSummarySection } from './form-fields/PriceSummarySection'
import { RegionField } from './form-fields/RegionField'
import { StorageTypeField } from './form-fields/StorageTypeField'
import { TermLengthSection } from './form-fields/TermLengthSection'
import type { VpsFormData } from './schemas'

export const OrderForm = ({ dFlowUser }: { dFlowUser: any }) => {
  const form = useFormContext<VpsFormData>()
  const searchParams = useSearchParams()
  const params = useParams<{ organisation: string }>()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { pricing, selectedAccount, vpsPlan } = useDflowVpsForm()

  const {
    execute: executeCreateVPSOrderAction,
    isPending: isCreatingVpsOrder,
    hasSucceeded: createdVPSOrder,
    result: createdVPSOrderResult,
  } = useAction(createVPSOrderAction, {
    onExecute: () => {
      setOpen(true)
    },
    onError: ({ error }) => {
      toast.error(`Failed to create server instance: ${error.serverError}`)
      setOpen(false)
    },
    onSuccess: ({ data }) => {
      const { data: createdData } = data

      setTimeout(() => {
        router.push(`/${params.organisation}/servers/${createdData.serverId}`)
      }, 5000)
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

    const license = data.license

    executeCreateVPSOrderAction({
      accountId: selectedAccount.id,
      sshKeyIds: data.login.sshKeyIds,
      vps: {
        plan: vpsPlan.id,
        displayName: data.displayName,
        image: {
          imageId: data.image.versionId,
          priceId: data.image.priceId,
        },
        ...(license
          ? {
              license,
            }
          : {}),
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

  const onboardingCompleted = !!dFlowUser?.acceptedTermsDate

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
          <ImageLicenseField />
          {/* <LoginDetailsSection /> */}
          {/* <SshKeySection /> */}
          <BackupOptionsSection />
          <PriceSummarySection />

          {!onboardingCompleted && (
            <Alert variant='warning'>
              <AlertTitle>Onboarding not completed!</AlertTitle>
              <AlertDescription>
                Please complete onboarding process for using our services,
                attach Discord account & accept our Terms of Service{' '}
                <a
                  className='text-foreground inline-block underline'
                  href={`${DFLOW_CONFIG.URL}/dashboard?terms-of-service=true`}
                  rel='noopener noreferrer'
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

      <Dialog
        open={open}
        onOpenChange={state => {
          if (isCreatingVpsOrder) {
            return
          }

          setOpen(state)
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {createdVPSOrder
                ? `🎉 Successfully placed ${vpsPlan?.name} order`
                : `Processing Your ${vpsPlan?.name} order`}
            </DialogTitle>
            <DialogDescription>
              {createdVPSOrder
                ? 'Your VPS order has been successfully placed.'
                : "Your VPS order is being placed. Please wait we'll redirect once order is placed..."}
            </DialogDescription>
          </DialogHeader>

          <div className='flex items-center justify-center pt-4'>
            {createdVPSOrder ? (
              <div className='flex flex-col items-center justify-center gap-3'>
                <div className='bg-primary/10 grid size-20 place-items-center rounded-full'>
                  <Check className='text-primary size-12' />
                </div>

                <p className='text-muted-foreground text-sm'>
                  You'll be redirected to your server page shortly.{' '}
                  <Link
                    className='text-primary underline'
                    href={`/${params.organisation}/servers/${createdVPSOrderResult?.data?.data?.serverId}`}>
                    Click here
                  </Link>{' '}
                  if your not redirected
                </p>
              </div>
            ) : (
              <Loader className='text-primary h-max w-max [&>svg]:size-12' />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
