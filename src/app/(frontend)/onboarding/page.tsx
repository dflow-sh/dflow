import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

const payload = await getPayload({
  config: configPromise,
})

export default async function OnboardingPage() {
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
    redirect('/onboarding/ssh-keys')
  } else if (servers.totalDocs === 0) {
    redirect('/onboarding/add-server')
  } else if (gitProviders.totalDocs === 0) {
    redirect('/onboarding/install-github')
  } else {
    redirect('/dashboard')
  }

  return <div>Onboarding Page</div>
}
