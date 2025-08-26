import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { getAuthConfigAction } from '@/actions/pages/auth'
import Loader from '@/components/Loader'
import SignUpForm from '@/components/sign-up/SignUpForm'
import { AuthConfig } from '@/payload-types'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

const SuspensePage = async ({ token }: { token: string | undefined }) => {
  // Check auth config to determine if sign-up is allowed
  const result = await getAuthConfigAction()
  const authMethod = (result?.data?.authConfig.authMethod ||
    'both') as AuthConfig['authMethod']

  // If authMethod is magic-link only, redirect to sign-in
  if (authMethod === 'magic-link') {
    redirect('/sign-in')
  }

  // Only allow sign-up for email-password or both methods
  return <SignUpForm token={token} />
}

const SignUpPage = async ({ searchParams }: PageProps) => {
  const token = (await searchParams)?.token
  return (
    <Suspense fallback={<Loader />}>
      <SuspensePage token={token} />
    </Suspense>
  )
}

export default SignUpPage
