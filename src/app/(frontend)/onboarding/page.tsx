import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

const payload = await getPayload({
  config: configPromise,
})

export default async function OnboardingPage() {
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    redirect('/sign-in')
  }

  const sshKeys = await payload.count({
    collection: 'sshKeys',
  })

  const servers = await payload.count({
    collection: 'servers',
  })

  const gitProviders = await payload.count({
    collection: 'gitProviders',
  })

  if (sshKeys.totalDocs === 0) {
    redirect('/onboarding/sshKeyGen')
  } else if (servers.totalDocs === 0) {
    redirect('/onboarding/add-server')
  } else if (gitProviders.totalDocs === 0) {
    redirect('/onboarding/install-github')
  } else {
    redirect('/dashboard')
  }

  return <div>Onboarding Page</div>
}
