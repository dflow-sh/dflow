'use client'

import Loader from '../Loader'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { resetPasswordAction } from '@/actions/auth'
import { resetPasswordSchema } from '@/actions/auth/validator'
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

const ResetPasswordForm = ({ token }: { token: string }) => {
  const router = useRouter()

  const {
    execute: mutate,
    isPending,
    hasSucceeded: isSuccess,
    hasErrored: isError,
    result,
  } = useAction(resetPasswordAction, {
    onSuccess: () => {
      toast.success('Password reset successful!', {
        duration: 5000,
      })
      router.push('/sign-in')
    },
    onError: ({ error }) => {
      toast.error(`Failed to Send Reset Link: ${error.serverError}`, {
        duration: 5000,
      })
    },
  })

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: { token, password: '', confirmPassword: '' },
  })

  const { handleSubmit } = form

  const onSubmit = (data: z.infer<typeof resetPasswordSchema>) => {
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
          <h1 className='mb-6 text-center text-3xl font-semibold'>
            Reset your password
          </h1>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name={'password'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>

                    <FormControl>
                      <Input disabled={isSuccess} {...field} type='password' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name={'confirmPassword'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>

                      <FormControl>
                        <Input
                          disabled={isSuccess}
                          {...field}
                          type='password'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                className='w-full'
                type='submit'
                disabled={isPending || isSuccess}>
                {isPending ? <Loader /> : 'Reset Password'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordForm
