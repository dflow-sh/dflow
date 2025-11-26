import { Suspense } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthConfigAction } from '@dflow/core/actions/pages/auth'
import Loader from '@dflow/core/components/Loader'
import SignUpForm from '@dflow/core/components/sign-up/SignUpForm'
import { DFLOW_CONFIG } from '@dflow/core/lib/constants'
import { AuthConfig } from '@dflow/core/payload-types'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

const SuspensePage = async ({ token }: { token: string | undefined }) => {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const redirectionURL = DFLOW_CONFIG.URL
  if (host === 'app.dflow.sh') {
    redirect(`${redirectionURL}/sign-up`)
  }

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
