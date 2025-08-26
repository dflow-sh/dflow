'use client'

import Loader from '../Loader'
import Logo from '../Logo'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail, User, UserPlus } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { signUpAction } from '@/actions/auth'
import { signUpSchema } from '@/actions/auth/validator'
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
import { slugify } from '@/lib/slugify'

interface SignupProps {
  token: string | undefined
}

const SignUpForm: React.FC<SignupProps> = ({ token }) => {
  const router = useRouter()
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const { handleSubmit } = form
  const { execute, isPending } = useAction(signUpAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success('Account created successfully!')
        router.push(token ? `/sign-in?token=${token}` : '/sign-in')
      }
    },
    onError: ({ error }) => {
      console.log({ error })
      toast.error(`Failed to create account: ${error.serverError}`)
    },
  })

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    execute(data)
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md space-y-6'>
        <Card className='shadow-lg'>
          <CardHeader className='space-y-1 pb-4'>
            <Logo className='mx-auto mb-4 max-h-28' />
            <CardTitle className='text-center text-2xl font-semibold'>
              Create an account
            </CardTitle>
            <CardDescription className='text-center'>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <FormField
                  control={form.control}
                  name={'username'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <User className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                          <Input
                            {...field}
                            onChange={e => {
                              e.stopPropagation()
                              e.preventDefault()
                              e.target.value = slugify(e.target.value)
                              field.onChange(e)
                            }}
                            type='text'
                            placeholder='john-doe'
                            className='pl-10'
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                            {...field}
                            type='email'
                            placeholder='johndoe@example.com'
                            className='pl-10'
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={'password'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Lock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                          <Input {...field} type='password' className='pl-10' />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={'confirmPassword'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Lock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                          <Input {...field} type='password' className='pl-10' />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='pt-4'>
                  <Button type='submit' className='w-full' disabled={isPending}>
                    {isPending ? (
                      <Loader />
                    ) : (
                      <>
                        <UserPlus className='mr-2 h-4 w-4' />
                        Sign Up
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className='text-center text-sm text-muted-foreground'>
          Already have an account?{' '}
          <Link
            href={token ? `/sign-in?token=${token}` : '/sign-in'}
            className='font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline'>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SignUpForm
