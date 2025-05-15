import { Suspense } from 'react'

import Loader from '@/components/Loader'
import SignUpForm from '@/components/sign-up/SignUpForm'

const SuspensePage = async () => {
  return <SignUpForm />
}

const SignUpPage = async () => {
  return (
    <Suspense fallback={<Loader />}>
      <SuspensePage />
    </Suspense>
  )
}

export default SignUpPage
