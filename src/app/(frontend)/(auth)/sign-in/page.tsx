import { env } from 'env'

import { getAuthConfigAction } from '@/actions/pages/auth'
import SignInForm from '@/components/sign-in/SignInForm'
import { AuthConfig } from '@/payload-types'

const SignInPage = async () => {
  const result = await getAuthConfigAction()
  const authMethod = (result?.data?.authConfig.authMethod ||
    'both') as AuthConfig['authMethod']

  const resendEnvExist = !!(
    env?.RESEND_API_KEY &&
    env?.RESEND_SENDER_EMAIL &&
    env?.RESEND_SENDER_NAME
  )

  return <SignInForm resendEnvExist={resendEnvExist} authMethod={authMethod} />
}

export default SignInPage
