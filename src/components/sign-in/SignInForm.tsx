'use client'

import Logo from '../Logo'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderIcon, Lock, LogIn, Mail, Zap } from 'lucide-react'
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

  // Type assertion to ensure proper typing
  const method = authMethod as AuthConfig['authMethod']

  // Unified form
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

  // signIn action (only if password auth is allowed)
  const {
    execute: signInMutate,
    isPending: isSignInPending,
    hasSucceeded: isSignInSuccess,
  } = useAction(signInAction, {
    onSuccess: () => {
      if (token) {
        router.replace(`/invite?token=${token}`)
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to sign in: ${error.serverError}`, { duration: 5000 })
    },
  })

  // magic link action (only if magic link is allowed)
  const {
    execute: magicLinkMutate,
    isPending: isMagicPending,
    hasSucceeded: isMagicSuccess,
  } = useAction(requestMagicLinkAction, {
    onSuccess: () => {
      toast.success('Magic link sent to your email.')
    },
    onError: ({ error }) => {
      toast.error(`Failed to send magic link: ${error.serverError}`, {
        duration: 5000,
      })
    },
  })

  // Unified form submission handler
  const onSubmit = (data: z.infer<typeof dynamicSignInSchema>) => {
    if (isPasswordMode && data.password) {
      // Sign in with email and password
      const signInData = { email: data.email, password: data.password }
      signInMutate(signInData)
    } else if (isMagicLinkMode) {
      // Send magic link
      const magicData = { email: data.email }
      magicLinkMutate(magicData)
    }
  }

  const isPending = isSignInPending || isMagicPending
  const isSuccess = isSignInSuccess || isMagicSuccess

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

    // For email-password only mode
    if (method === 'email-password') {
      return (
        <>
          <LogIn className='mr-2 h-4 w-4' />
          Sign in
        </>
      )
    }

    // For magic-link only mode
    if (method === 'magic-link') {
      return (
        <>
          <Zap className='mr-2 h-4 w-4' />
          Send magic link
        </>
      )
    }

    // For both mode - dynamic based on password presence
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
    if (method === 'email-password') {
      return 'Enter your email and password to sign in'
    }
    if (method === 'magic-link') {
      return 'Enter your email to receive a magic link'
    }
    if (isPasswordMode) {
      return 'Enter your email and password to sign in'
    }
    if (isMagicLinkMode) {
      return 'Enter your email to receive a magic link'
    }
    return 'Sign in to your account to continue'
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
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
                onSubmit={form.handleSubmit(onSubmit)}
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
                          <Mail className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                          <Input
                            disabled={isSuccess}
                            placeholder='john.doe@example.com'
                            className='pl-10'
                            {...field}
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
                              <span className='text-sm font-normal text-muted-foreground'>
                                (optional)
                              </span>
                            )}
                          </FormLabel>
                          {resendEnvExist && showForgotPassword && (
                            <Link
                              href='/forgot-password'
                              className='text-xs text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline'>
                              Forgot password?
                            </Link>
                          )}
                        </div>
                        <FormControl>
                          <div className='relative'>
                            <Lock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                            <Input
                              disabled={isSuccess}
                              type='password'
                              placeholder={
                                method === 'both'
                                  ? 'Enter password or leave empty for magic link'
                                  : 'Enter your password'
                              }
                              className='pl-10'
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        {method === 'both' && !hasPassword && (
                          <p className='text-xs text-muted-foreground'>
                            Leave empty to receive a magic link instead
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                )}

                {/* Magic link info for magic-link-only mode */}
                {method === 'magic-link' && (
                  <p className='text-sm text-muted-foreground'>
                    We'll send you a secure link to sign in instantly.
                  </p>
                )}

                <Button
                  className='w-full'
                  type='submit'
                  disabled={isPending || isSuccess}>
                  {getButtonContent()}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Conditional Sign Up Link - COMPLETELY HIDDEN for magic-link only */}
        {showSignUpLink && (
          <div className='text-center text-sm text-muted-foreground'>
            Don't have an account?{' '}
            <Link
              href={token ? `/sign-up?token=${token}` : '/sign-up'}
              className='font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline'>
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default SignInForm
