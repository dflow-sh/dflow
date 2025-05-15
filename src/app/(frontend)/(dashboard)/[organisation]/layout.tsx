import { getTenant } from '@/lib/get-tenant'
import RefreshProvider from '@/providers/RefreshProvider'

const OrganisationLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ organisation: string }>
}) => {
  //this is to validate the organisation slug and set the cookie
  // if the slug is not valid, it will throw an error and redirect to 403 page
  await getTenant()

  return (
    <>
      {/* <SetOrganisationCookie organisationSlug={organisation as string} /> */}
      <RefreshProvider>{children}</RefreshProvider>
    </>
  )
}

OrganisationLayout.displayName = 'OrganisationLayout'

export default OrganisationLayout
