import configPromise from '@payload-config'
import { SquareTerminal } from 'lucide-react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

import Loader from '@/components/Loader'
import ServerTerminal from '@/components/ServerTerminal'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { SidebarInset } from '@/components/ui/sidebar'
import Provider from '@/providers/Provider'

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

const SuspenseLayout = async ({ children }: { children: React.ReactNode }) => {
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: headersList })

  // Redirecting user to sign-in if user is not signed in
  if (!user) {
    return redirect('/sign-in')
  }

  return (
    <>
      <AppSidebar user={user} />
      <SidebarInset>
        <main className='mt-4 px-4'>{children}</main>
      </SidebarInset>
    </>
  )
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    // Added a suspense boundary to show loading response until user promise is resolved
    <Provider>
      <Suspense fallback={<Loader />}>
        <SuspenseLayout>{children}</SuspenseLayout>
      </Suspense>

      <Suspense
        fallback={
          <Button
            size='icon'
            variant='secondary'
            disabled
            className='fixed bottom-4 right-4 z-40 size-16 [&_svg]:size-8'>
            <SquareTerminal />
          </Button>
        }>
        <SuspendedTerminal />
      </Suspense>
    </Provider>
  )
}
