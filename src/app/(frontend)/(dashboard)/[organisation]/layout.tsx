import SetOrganisationCookie from '@/components/SetOrganisationCookie'
import { getTenant } from '@/lib/get-tenant'

const OrganisationLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ organisation: string }>
}) => {
  const { organisation } = await params

  //this is to validate the organisation slug and set the cookie
  // if the slug is not valid, it will throw an error and redirect to 403 page
  await getTenant({ organisation })
  return (
    <>
      <SetOrganisationCookie organisationSlug={organisation as string} />
      {children}
    </>
  )
}

OrganisationLayout.displayName = 'OrganisationLayout'

export default OrganisationLayout
