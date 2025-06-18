'use client'

import Loader from '../Loader'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { forgotPasswordAction } from '@/actions/auth'
import { forgotPasswordSchema } from '@/actions/auth/validator'
import { Button } from '@/components/ui/button'
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
    <div className='flex min-h-screen w-full items-center justify-center'>
      <div className='mx-auto w-full max-w-md drop-shadow-2xl'>
        <div className='w-full max-w-md p-6'>
          <Image
            src='/images/dflow-no-bg.png'
            alt='dFlow logo'
            className='m-auto mb-4'
            width={50}
            height={50}
          />
          {!isSuccess && (
            <h1 className='mb-6 text-center text-3xl font-semibold'>
              Forgot your password?
            </h1>
          )}
          {isSuccess ? (
            <div className='mx-auto max-w-sm rounded-md border border-border bg-card/30'>
              <p className='px-10 py-10 text-center text-lg text-green-600'>
                Reset link sent to your email. Don't forget to check your spam
                inbox!
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <FormField
                  control={form.control}
                  name={'email'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>

                      <FormControl>
                        <Input
                          disabled={isSuccess}
                          {...field}
                          placeholder='john.doe@example.com'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  className='w-full'
                  type='submit'
                  disabled={isPending || isSuccess}>
                  {isPending ? <Loader /> : 'Send Reset Link'}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordForm
