import { env } from 'env'

import SignInForm from '@/components/sign-in/SignInForm'

const SignInPage = () => {
  const resendEnvExist = !!(
    env?.RESEND_API_KEY &&
    env?.RESEND_SENDER_EMAIL &&
    env?.RESEND_SENDER_NAME
  )
  return <SignInForm resendEnvExist={resendEnvExist} />
}

export default SignInPage
