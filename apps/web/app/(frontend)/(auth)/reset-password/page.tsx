import { notFound } from 'next/navigation'

import { getAuthConfigAction } from '@dflow/actions/pages/auth'
import ResetPasswordForm from '@dflow/components/reset-password/ResetPasswordForm'
import { AuthConfig } from '@/payload-types'

const ResetPasswordPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) => {
  const syncSearchParams = await searchParams
  const token = syncSearchParams?.token || null

  // Check auth config to determine if reset-password is allowed
  const result = await getAuthConfigAction()

  const authMethod = (result?.data?.authConfig.authMethod ||
    'both') as AuthConfig['authMethod']

  // If authMethod is magic-link only, return not-found
  if (authMethod === 'magic-link') {
    notFound()
  }

  return <ResetPasswordForm token={token as string} />
}

export default ResetPasswordPage
