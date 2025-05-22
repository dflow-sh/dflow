import { getUserAction } from '@/actions/auth'
import RefreshProvider from '@/providers/RefreshProvider'

const OrganisationLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  // this is to validate the organisation slug and set the cookie
  // if the slug is not valid, it will throw an error and redirect to 403 page
  await getUserAction()

  return <RefreshProvider>{children}</RefreshProvider>
}

OrganisationLayout.displayName = 'OrganisationLayout'

export default OrganisationLayout
