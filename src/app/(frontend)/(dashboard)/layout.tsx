import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

import Loader from '@/components/Loader'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset } from '@/components/ui/sidebar'
import Provider from '@/providers/Provider'

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: headersList })

  // Redirecting user to sign-in if user is not signed in
  if (!user) {
    redirect('/sign-in')
  }

  if (!user.onboarded) {
    redirect('/onboarding')
  }

  return (
    <>
      <AppSidebar user={user} />
      <SidebarInset>
        <main className='mb-10 mt-4 px-4'>{children}</main>
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
        <DashboardLayout>{children}</DashboardLayout>
      </Suspense>
    </Provider>
  )
}
