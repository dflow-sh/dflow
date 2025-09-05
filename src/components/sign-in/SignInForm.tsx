'use client'

import Logo from '../Logo'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderIcon, Lock, LogIn, Mail, RotateCcw, Zap } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { requestMagicLinkAction, signInAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AuthConfig } from '@/payload-types'

// Dynamic schema that validates based on auth method
const dynamicSignInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().optional(),
})

interface SignInFormProps {
  resendEnvExist: boolean
  authMethod: AuthConfig['authMethod']
}

const SignInForm: React.FC<SignInFormProps> = ({
  resendEnvExist,
  authMethod,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const method = authMethod as AuthConfig['authMethod']

  const form = useForm<z.infer<typeof dynamicSignInSchema>>({
    resolver: zodResolver(dynamicSignInSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  })

  const watchPassword = form.watch('password')
  const hasPassword = watchPassword && watchPassword.length > 0

  // Determine what features to show based on authMethod
  const showPasswordField = method !== 'magic-link'
  const showMagicLink = method !== 'email-password'
  const showSignUpLink = method !== 'magic-link' // Hide sign up for magic-link only
  const showForgotPassword = method !== 'magic-link'

  // Determine the form mode based on password presence and allowed methods
  const isPasswordMode = hasPassword && showPasswordField
  const isMagicLinkMode = !hasPassword && showMagicLink

  // signIn action
  const {
    execute: signInMutate,
    isPending: isSignInPending,
    hasSucceeded: isSignInSuccess,
    hasErrored: isSignInError,
    reset: resetSignIn,
  } = useAction(signInAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data?.redirectUrl) {
        toast.success('Successfully signed in!')

        // Handle redirect based on token presence
        if (token) {
          router.push(`/invite?token=${token}`)
        } else {
          router.push(data.redirectUrl)
        }
      } else if (data?.error) {
        toast.error(data.error, { duration: 5000 })
        // Reset the action state to clear the success flag
        resetSignIn()
      }
    },
    onError: ({ error }) => {
      const errorMessage =
        error.serverError || 'An unexpected error occurred during sign in'
      toast.error(errorMessage, { duration: 5000 })
    },
  })

  // magic link action
  const {
    execute: magicLinkMutate,
    isPending: isMagicPending,
    hasSucceeded: isMagicSuccess,
    hasErrored: isMagicError,
    reset: resetMagicLink,
  } = useAction(requestMagicLinkAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message || 'Magic link sent to your email!')
        form.setValue('password', '')
      } else if (data?.error) {
        toast.error(data.error, { duration: 5000 })
        // Reset the action state to clear the success flag
        resetMagicLink()
      }
    },
    onError: ({ error }) => {
      const errorMessage =
        error.serverError || 'Failed to send magic link. Please try again.'
      toast.error(errorMessage, { duration: 5000 })
    },
  })

  // Declare disable variables
  const isPending = isSignInPending || isMagicPending
  const isSuccess = isSignInSuccess || isMagicSuccess
  const isError = isSignInError || isMagicError

  // Main disable state - disable all when pending or successful
  const isFormDisabled = isPending || isSuccess
  const isInputDisabled = isFormDisabled
  const isSubmitButtonDisabled = isFormDisabled
  const isResendButtonDisabled = isPending // Only disable resend during pending, not success

  // Derived variable: Replace showResend state with computed value
  const shouldShowResendButton =
    isMagicSuccess && !isMagicError && isMagicLinkMode && !isPending

  // Unified form submission handler
  const onSubmit = async (data: z.infer<typeof dynamicSignInSchema>) => {
    if (isPasswordMode && data.password) {
      signInMutate({ email: data.email.trim(), password: data.password })
    } else if (isMagicLinkMode) {
      magicLinkMutate({ email: data.email.trim() })
    }
  }

  // Handle resend magic link
  const handleResend = async () => {
    const email = form.getValues('email')
    if (email && email.trim()) {
      await magicLinkMutate({ email: email.trim() })
    } else {
      toast.error('Please enter a valid email address first.')
    }
  }

  // Handle form validation errors
  const onFormError = (errors: any) => {
    const firstErrorKey = Object.keys(errors)[0]
    if (firstErrorKey && errors[firstErrorKey]?.message) {
      toast.error(errors[firstErrorKey].message, { duration: 3000 })
    }
  }

  // Dynamic button content
  const getButtonContent = () => {
    if (isPending) {
      return (
        <>
          <LoaderIcon className='mr-2 h-4 w-4 animate-spin' />
          {isPasswordMode ? 'Signing in...' : 'Sending link...'}
        </>
      )
    }

    if (isSuccess) {
      if (isPasswordMode) {
        return (
          <>
            <LogIn className='mr-2 h-4 w-4' />
            Signed in successfully!
          </>
        )
      }
      return (
        <>
          <Zap className='mr-2 h-4 w-4' />
          Magic link sent!
        </>
      )
    }

    if (method === 'email-password') {
      return (
        <>
          <LogIn className='mr-2 h-4 w-4' />
          Sign in
        </>
      )
    }

    if (method === 'magic-link') {
      return (
        <>
          <Zap className='mr-2 h-4 w-4' />
          Send magic link
        </>
      )
    }

    if (isPasswordMode) {
      return (
        <>
          <LogIn className='mr-2 h-4 w-4' />
          Sign in
        </>
      )
    }

    return (
      <>
        <Zap className='mr-2 h-4 w-4' />
        Send magic link
      </>
    )
  }

  // Dynamic description based on mode
  const getDescription = () => {
    if (method === 'email-password')
      return 'Enter your email and password to sign in'
    if (method === 'magic-link')
      return 'Enter your email to receive a magic link'
    if (isPasswordMode) return 'Enter your email and password to sign in'
    if (isMagicLinkMode) return 'Enter your email to receive a magic link'
    return 'Sign in to your account to continue'
  }

  return (
    <div className='bg-background flex min-h-screen items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-6'>
        <Card className='shadow-lg'>
          <CardHeader className='space-y-1 pb-4'>
            <Logo className='mx-auto mb-4 max-h-28' />
            <CardTitle className='text-center text-2xl font-semibold'>
              Welcome back
            </CardTitle>
            <CardDescription className='text-center'>
              {getDescription()}
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-6'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, onFormError)}
                className='space-y-4'>
                {/* Email Field - Always shown */}
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Mail className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
                          <Input
                            disabled={isInputDisabled}
                            placeholder='john.doe@example.com'
                            className='pl-10'
                            {...field}
                            onChange={e => {
                              field.onChange(e)
                              if (form.formState.errors.email) {
                                form.clearErrors('email')
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Conditional Password Field - Only shown if authMethod allows */}
                {showPasswordField && (
                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <div className='flex items-center justify-between'>
                          <FormLabel>
                            Password{' '}
                            {method === 'both' && (
                              <span className='text-muted-foreground text-sm font-normal'>
                                (optional)
                              </span>
                            )}
                          </FormLabel>
                          {resendEnvExist && showForgotPassword && (
                            <Link
                              href='/forgot-password'
                              className='text-primary hover:text-primary/80 text-xs underline-offset-4 transition-colors hover:underline'>
                              Forgot password?
                            </Link>
                          )}
                        </div>
                        <FormControl>
                          <div className='relative'>
                            <Lock className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
                            <Input
                              disabled={isInputDisabled}
                              type='password'
                              placeholder={
                                method === 'both'
                                  ? 'Enter password or leave empty for magic link'
                                  : 'Enter your password'
                              }
                              className='pl-10'
                              {...field}
                              onChange={e => {
                                field.onChange(e)
                                if (form.formState.errors.password) {
                                  form.clearErrors('password')
                                }
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        {method === 'both' && !hasPassword && (
                          <p className='text-muted-foreground text-xs'>
                            Leave empty to receive a magic link instead
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                )}

                {/* Magic link info for magic-link-only mode */}
                {method === 'magic-link' && (
                  <p className='text-muted-foreground text-sm'>
                    We'll send you a secure link to sign in instantly.
                  </p>
                )}

                <Button
                  className='w-full'
                  type='submit'
                  disabled={isSubmitButtonDisabled}>
                  {getButtonContent()}
                </Button>

                {/* Resend Magic Link Button - Only shown when conditions are met */}
                {shouldShowResendButton && (
                  <Button
                    variant='outline'
                    className='w-full'
                    type='button'
                    onClick={handleResend}
                    disabled={isResendButtonDisabled}>
                    <RotateCcw className='mr-2 h-4 w-4' />
                    Resend magic link
                  </Button>
                )}
              </form>
            </Form>

            {/* Additional help text when resend is available */}
            {shouldShowResendButton && (
              <p className='text-muted-foreground text-center text-xs'>
                Didn't receive the email? Check your spam folder or click resend
                above.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Conditional Sign Up Link - COMPLETELY HIDDEN for magic-link only */}
        {showSignUpLink && (
          <div className='text-muted-foreground text-center text-sm'>
            Don't have an account?{' '}
            <Link
              href={token ? `/sign-up?token=${token}` : '/sign-up'}
              className='text-primary hover:text-primary/80 font-medium underline-offset-4 transition-colors hover:underline'>
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default SignInForm
