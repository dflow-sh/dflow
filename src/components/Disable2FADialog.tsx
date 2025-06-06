'use client'

import { ShieldOff, XCircle } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useRef, useState } from 'react'

import { disable2FA, verify2FASetup } from '@/actions/auth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function Disable2FADialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [digits, setDigits] = useState(Array(6).fill(''))
  const inputRefs = useRef<HTMLInputElement[]>([])
  const [step, setStep] = useState<'verify' | 'confirm'>('verify')
  const [error, setError] = useState<string | null>(null)

  const token = digits.join('')

  const {
    execute: verify,
    result: verifyResult,
    status: verifyStatus,
  } = useAction(verify2FASetup)

  const { execute: disable, status: disableStatus } = useAction(disable2FA)

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const newDigits = [...digits]
    newDigits[index] = value
    setDigits(newDigits)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter' && token.length === 6 && step === 'verify') {
      handleVerify()
    }
  }

  const handleVerify = () => {
    setError(null)
    verify({ token })
  }

  useEffect(() => {
    if (verifyStatus === 'hasSucceeded') {
      if (verifyResult?.data?.success) {
        setStep('confirm')
      } else if (verifyResult?.serverError) {
        setError(verifyResult.serverError)
      }
    }
  }, [verifyStatus, verifyResult])

  const handleDisable = () => {
    disable()
  }

  useEffect(() => {
    if (disableStatus === 'hasSucceeded') {
      location.reload()
    }
  }, [disableStatus])

  useEffect(() => {
    if (open) {
      setDigits(Array(6).fill(''))
      setStep('verify')
      setError(null)
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-sm'>
        <DialogHeader>
          <DialogTitle>
            <ShieldOff className='mr-2 inline-block' />
            Disable Two-Factor Authentication
          </DialogTitle>
        </DialogHeader>

        {step === 'verify' && (
          <form
            onSubmit={e => {
              e.preventDefault()
              if (token.length === 6) handleVerify()
            }}
            className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              Enter your current 2FA code to confirm identity.
            </p>

            <div className='flex justify-center gap-2'>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => {
                    inputRefs.current[i] = el!
                  }}
                  type='text'
                  inputMode='numeric'
                  pattern='\d*'
                  maxLength={1}
                  className='h-12 w-10 rounded-md border border-border bg-card text-center text-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(e, i)}
                  disabled={verifyStatus === 'executing'}
                />
              ))}
            </div>

            {verifyStatus === 'hasErrored' && (
              <Alert variant='destructive'>
                <XCircle className='h-4 w-4' />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {verifyResult.serverError || 'Invalid authentication code.'}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type='submit'
                disabled={token.length !== 6 || verifyStatus === 'executing'}>
                {verifyStatus === 'executing' ? 'Verifying...' : 'Verify'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'confirm' && (
          <div className='space-y-4'>
            <p className='text-sm'>
              Are you sure you want to <strong>disable</strong> Two-Factor
              Authentication?
            </p>
            <DialogFooter className='flex justify-between'>
              <Button
                variant='outline'
                onClick={onClose}
                disabled={disableStatus === 'executing'}>
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={handleDisable}
                disabled={disableStatus === 'executing'}>
                {disableStatus === 'executing' ? 'Disabling...' : 'Disable 2FA'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
