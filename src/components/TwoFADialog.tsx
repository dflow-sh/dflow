'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { generate2FASetup, verify2FASetup } from '@/actions/auth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function TwoFADialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const {
    execute: generate,
    result: setupResult,
    status: setupStatus,
  } = useAction(generate2FASetup)

  const {
    execute: verify,
    result: verifyResult,
    status: verifyStatus,
  } = useAction(verify2FASetup)

  const [digits, setDigits] = useState(Array(6).fill(''))
  const inputRefs = useRef<HTMLInputElement[]>([])

  const token = digits.join('')
  const isVerifying = verifyStatus === 'executing'
  const isSuccess = verifyResult.data?.success
  const isError = verifyStatus === 'hasErrored'

  useEffect(() => {
    if (open) {
      generate()
      setDigits(Array(6).fill(''))
      inputRefs.current[0]?.focus()
    }
  }, [open])

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
  }

  const qrCode = setupResult.data?.qrCode
  const manualCode = setupResult.data?.manualCode

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
        </DialogHeader>

        {setupStatus === 'executing' && (
          <div className='flex flex-col items-center gap-4 py-6'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary' />
            <p className='text-sm text-muted-foreground'>
              Generating your 2FA setup...
            </p>
          </div>
        )}

        {qrCode && (
          <div className='space-y-4'>
            <Image
              height={1000}
              width={1000}
              src={qrCode}
              alt='2FA QR Code'
              className='mx-auto h-48 w-48'
            />
            <p className='text-center'>Scan this with your authenticator app</p>
            <p className='space-y-2 overflow-hidden break-words text-center text-sm text-muted-foreground'>
              Or enter manually: <br />
              <code className='inline-block max-w-full break-all rounded bg-muted px-2 py-1 font-mono text-xs'>
                {manualCode}
              </code>
            </p>

            {/* Six-digit input boxes */}
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
                  disabled={isVerifying || isSuccess}
                />
              ))}
            </div>
            {isError && (
              <Alert variant='destructive'>
                <XCircle className='h-4 w-4' />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {verifyResult.serverError || 'Invalid authentication code.'}
                </AlertDescription>
              </Alert>
            )}
            {isSuccess && (
              <Alert variant='info'>
                <CheckCircle className='h-4 w-4' />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Two-factor authentication is now enabled.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={() => verify({ token })}
            disabled={token.length !== 6 || isVerifying || isSuccess}>
            {isVerifying ? 'Verifying...' : 'Verify & Enable'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
