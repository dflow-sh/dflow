import { getTenant } from '@/lib/get-tenant'

const OrganisationLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { user, isInTenant, userTenant } = await getTenant()
  return <>{children}</>
}

OrganisationLayout.displayName = 'OrganisationLayout'

export default OrganisationLayout
