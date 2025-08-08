'use client'

import Loader from '../Loader'
import Logo from '../Logo'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { signInAction } from '@/actions/auth'
import { signInSchema } from '@/actions/auth/validator'
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

const SignInForm: React.FC<{ resendEnvExist: boolean }> = ({
  resendEnvExist,
}) => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()
  const {
    execute: mutate,
    isPending,
    hasSucceeded: isSuccess,
    hasErrored: isError,
    result,
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

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { handleSubmit } = form

  const onSubmit = (data: z.infer<typeof signInSchema>) => {
    mutate({
      ...data,
    })
  }

  return (
    <div className='flex min-h-screen w-full items-center justify-center'>
      <div className='mx-auto w-full max-w-md drop-shadow-2xl'>
        <div className='w-full max-w-md p-6'>
          <Logo
            className='mx-auto mb-2 max-h-28'
            skeletonClassName='mx-auto mb-2'
          />
          <h1 className='mb-6 text-center text-3xl font-semibold'>Sign In</h1>

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

              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name={'password'}
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex justify-between'>
                        <FormLabel>Password</FormLabel>
                        {resendEnvExist && (
                          <Link
                            className='ml-2 text-sm font-medium text-primary transition duration-150 ease-in-out'
                            href='/forgot-password'>
                            Forgot Password?
                          </Link>
                        )}
                      </div>
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
                {isPending ? <Loader /> : 'Sign In'}
              </Button>
            </form>
          </Form>

          <div className='mt-4 text-center text-sm text-muted-foreground'>
            <p>
              Don&apos;t have an account?{' '}
              <Link
                href={token ? `/sign-up?token=${token}` : '/sign-up'}
                className='text-primary underline'>
                SignUp
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInForm
