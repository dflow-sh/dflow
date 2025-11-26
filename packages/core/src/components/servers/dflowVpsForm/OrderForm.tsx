'use client'

import confetti from 'canvas-confetti'
import { useAction } from 'next-safe-action/hooks'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

import { createVPSOrderAction } from "@core/actions/cloud/dFlow"
import { getTermsUpdatedDateAction } from "@core/actions/github"
import AnimatedCheckIcon from "@core/components/icons/AnimatedCheckIcon"
import AnimatedCoinIcon from "@core/components/icons/AnimatedCoinIcon"
import AnimatedCrossIcon from "@core/components/icons/AnimatedCrossIcon"
import { Alert, AlertDescription, AlertTitle } from "@core/components/ui/alert"
import { Button } from "@core/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@core/components/ui/dialog"
import { Form } from "@core/components/ui/form"
import { DFLOW_CONFIG } from "@core/lib/constants"

import { useDflowVpsForm } from "@core/components/servers/dflowVpsForm/DflowVpsFormProvider"
import { BackupOptionsSection } from "@core/components/servers/dflowVpsForm/form-fields/BackupOptionsSection"
import { DisplayNameField } from "@core/components/servers/dflowVpsForm/form-fields/DisplayNameField"
import { ImageLicenseField } from "@core/components/servers/dflowVpsForm/form-fields/ImageLicenseField"
import { ImageSelection } from "@core/components/servers/dflowVpsForm/form-fields/ImageSelection"
import { ImageVersionField } from "@core/components/servers/dflowVpsForm/form-fields/ImageVersionField"
import { PriceSummarySection } from "@core/components/servers/dflowVpsForm/form-fields/PriceSummarySection"
import { RegionField } from "@core/components/servers/dflowVpsForm/form-fields/RegionField"
import { StorageTypeField } from "@core/components/servers/dflowVpsForm/form-fields/StorageTypeField"
import { TermLengthSection } from "@core/components/servers/dflowVpsForm/form-fields/TermLengthSection"
import type { VpsFormData } from "@core/components/servers/dflowVpsForm/schemas"

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
    hasErrored: failedCreatingVPSOrder,
  } = useAction(createVPSOrderAction, {
    onExecute: () => {
      setOpen(true)
    },
    onError: ({ error }) => {
      toast.error(`Failed to create server instance: ${error.serverError}`)
      setOpen(false)
    },
    onSuccess: () => {
      setTimeout(() => {
        router.push(`/${params.organisation}/servers`)
      }, 3000)
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

  const { result, execute } = useAction(getTermsUpdatedDateAction)

  useEffect(() => {
    execute()
  }, [])

  const onboardingCompleted = !!dFlowUser?.acceptedTermsDate
  const termsUpdated =
    dFlowUser?.acceptedTermsDate &&
    result?.data?.issuedDate &&
    new Date(dFlowUser?.acceptedTermsDate).getTime() <
      new Date(result?.data?.issuedDate).getTime()

  const paymentStatus = useMemo(() => {
    if (isCreatingVpsOrder) {
      return {
        icon: <AnimatedCoinIcon className='-translate-x-6 -translate-y-6' />,
        heading: `Processing your ${vpsPlan?.name} order`,
        description: 'Please do not close this window.',
      }
    }

    if (createdVPSOrder) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
      })

      return {
        icon: <AnimatedCheckIcon />,
        heading: `Order ${vpsPlan?.name} successfully placed`,
        description: "You'll be redirected to servers page.",
      }
    }

    if (failedCreatingVPSOrder) {
      return {
        icon: <AnimatedCrossIcon />,
        heading: `Failed to place ${vpsPlan?.name} order`,
        description: 'Please try again or contact our support!',
      }
    }
  }, [failedCreatingVPSOrder, createdVPSOrder, isCreatingVpsOrder])

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

          {(!onboardingCompleted || termsUpdated) && (
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
                !onboardingCompleted ||
                termsUpdated
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
        <DialogContent className='flex flex-col items-center gap-4 py-6'>
          <DialogHeader className='text-center'>
            <DialogTitle className='sr-only'>Payment Status</DialogTitle>
            <DialogDescription className='sr-only'>
              Your VPS order payment status displayed here
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col items-center justify-center pt-4'>
            {paymentStatus?.icon}

            <h2 className='mt-14 text-xl font-semibold'>
              {paymentStatus?.heading}
            </h2>
            <p className='text-muted-foreground text-sm'>
              {paymentStatus?.description}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
