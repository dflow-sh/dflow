import configPromise from '@payload-config'
import { getPayload } from 'payload'

import CreateGitAppForm from '@/components/gitProviders/CreateGitAppForm'
import GitProviderList from '@/components/gitProviders/GitProviderList'

const GitPage = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs: gitProvidersList } = await payload.find({
    collection: 'gitProviders',
    limit: 1000,
  })

  return (
    <section>
      <CreateGitAppForm />
      <GitProviderList gitProviders={gitProvidersList} />
    </section>
  )
}

export default GitPage
