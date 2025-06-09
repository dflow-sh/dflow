'use client'

import { useAction } from 'next-safe-action/hooks'
import { useEffect, useRef, useState } from 'react'

import { verify2FAandLogin } from '@/actions/auth'
import { Button } from '@/components/ui/button'

export default function TwoFactorPage() {
  const [code, setCode] = useState(Array(6).fill(''))
  const [error, setError] = useState('')
  const inputRefs = useRef<HTMLInputElement[]>([])

  const { execute, status } = useAction(verify2FAandLogin, {
    onSuccess() {
      // Redirect handled in server action
    },
    onError(err) {
      const message =
        err.error.serverError ??
        err.error.validationErrors?.token?._errors?.[0] ??
        'Invalid authentication code'
      setError(message)
    },
  })

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (value: string, idx: number) => {
    if (!/^\d?$/.test(value)) return // Only digits
    setError('') // Clear error on input

    const newCode = [...code]
    newCode[idx] = value
    setCode(newCode)

    if (value && idx < 5) {
      inputRefs.current[idx + 1]?.focus()
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) {
      const newCode = paste.split('')
      setCode(newCode)
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = () => {
    const token = code.join('')
    if (token.length === 6) {
      execute({ token })
    } else {
      setError('Please enter all 6 digits.')
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <div className='w-full max-w-md rounded-xl border p-6 shadow-lg'>
        <h1 className='mb-4 text-2xl font-semibold'>
          Two-Factor Authentication
        </h1>
        <p className='mb-6 text-sm text-gray-600'>
          Enter the 6-digit code from your authenticator app.
        </p>

        <div className='mb-4 flex justify-between gap-2'>
          {code.map((digit, idx) => (
            <input
              key={idx}
              ref={el => {
                inputRefs.current[idx] = el!
              }}
              type='text'
              inputMode='numeric'
              maxLength={1}
              value={digit}
              onChange={e => handleChange(e.target.value, idx)}
              onKeyDown={e => handleKeyDown(e, idx)}
              onPaste={handlePaste}
              onKeyPress={e => {
                if (!/\d/.test(e.key)) e.preventDefault()
              }}
              className='h-12 w-12 rounded-md border border-border bg-card text-center text-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
            />
          ))}
        </div>

        {error && <p className='mb-2 text-sm text-red-500'>{error}</p>}

        <Button
          variant={'default'}
          onClick={handleSubmit}
          disabled={status === 'executing'}
          className='w-full'>
          {status === 'executing' ? 'Verifying...' : 'Verify & Login'}
        </Button>
      </div>
    </div>
  )
}
