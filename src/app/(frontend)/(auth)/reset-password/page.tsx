import ResetPasswordForm from '@/components/reset-password/ResetPasswordForm'

const ResetPasswordPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) => {
  const syncSearchParams = await searchParams
  const token = syncSearchParams?.token || null

  return <ResetPasswordForm token={token as string} />
}

export default ResetPasswordPage
