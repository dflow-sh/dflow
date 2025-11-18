import { notFound } from 'next/navigation'

import { getAuthConfigAction } from '@dflow/actions/pages/auth'
import ForgotPasswordForm from '@dflow/components/forgot-password/ForgotPasswordForm'
import { AuthConfig } from '@/payload-types'

const ForgotPasswordPage = async () => {
  // Check auth config to determine if forgot-password is allowed
  const result = await getAuthConfigAction()
  const authMethod = (result?.data?.authConfig.authMethod ||
    'both') as AuthConfig['authMethod']

  // If authMethod is magic-link only, return not-found
  if (authMethod === 'magic-link') {
    notFound()
  }

  // Only allow forgot-password for email-password or both methods
  return <ForgotPasswordForm />
}

export default ForgotPasswordPage
