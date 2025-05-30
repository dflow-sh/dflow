import { Suspense } from 'react'

import Loader from '@/components/Loader'
import SignUpForm from '@/components/sign-up/SignUpForm'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

const SuspensePage = async ({ token }: { token: string | undefined }) => {
  // if (!token) {
  //   redirect('/')
  // }
  // const result = await verifyInviteToken(token)
  // if (result == null || result === 'expired') {
  //   redirect('/')
  // }
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
