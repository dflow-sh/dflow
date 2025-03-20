import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import ServerTerminal from '@/components/ServerTerminal'

const SuspendedTerminal = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs: servers } = await payload.find({
    collection: 'servers',
    pagination: false,
    select: {
      name: true,
    },
  })

  return <ServerTerminal servers={servers} />
}
const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <section>{children}</section>
      <Suspense>
        <SuspendedTerminal />
      </Suspense>
    </>
  )
}

export default SettingsLayout
