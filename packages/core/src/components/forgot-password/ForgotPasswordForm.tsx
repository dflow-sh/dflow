'use client'

import Loader from "@core/components/Loader"
import Logo from "@core/components/Logo"
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Send } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { forgotPasswordAction } from '@/actions/auth'
import { forgotPasswordSchema } from '@/actions/auth/validator'
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

const ForgotPasswordForm: React.FC = () => {
  const {
    execute: mutate,
    isPending,
    hasSucceeded: isSuccess,
    hasErrored: isError,
    result,
  } = useAction(forgotPasswordAction, {
    onError: ({ error }) => {
      toast.error(`Failed to Send Reset Link: ${error.serverError}`, {
        duration: 5000,
      })
    },
  })

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const { handleSubmit } = form

  const onSubmit = (data: z.infer<typeof forgotPasswordSchema>) => {
    mutate({
      ...data,
    })
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md space-y-6'>
        <Card className='shadow-lg'>
          <CardHeader className='space-y-1 pb-4'>
            <Logo className='mx-auto mb-4 max-h-28' />
            <CardTitle className='text-center text-2xl font-semibold'>
              Forgot your password?
            </CardTitle>
            <CardDescription className='text-center'>
              Enter your email to receive a reset link
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-6'>
            {isSuccess ? (
              <div className='rounded-md border border-border p-6 text-center'>
                <div className='mb-3 flex justify-center'>
                  <Mail className='h-8 w-8 text-green-600' />
                </div>
                <p className='text-lg text-green-600'>
                  Reset link sent to your email. Don't forget to check your spam
                  inbox!
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                  <FormField
                    control={form.control}
                    name={'email'}
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

                  <Button
                    className='w-full'
                    type='submit'
                    disabled={isPending || isSuccess}>
                    {isPending ? (
                      <Loader />
                    ) : (
                      <>
                        <Send className='mr-2 h-4 w-4' />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <div className='text-center text-sm text-muted-foreground'>
          Remember your password?{' '}
          <Link
            href='/sign-in'
            className='font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline'>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordForm
