import configPromise from '@payload-config'
import { Workflow } from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

import Loader from '@/components/Loader'
import { NavUser } from '@/components/nav-user'
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
    <div className='w-full'>
      <div className='mx-auto flex w-full max-w-6xl items-center justify-between p-4'>
        <div className='flex items-center gap-2 text-2xl font-semibold'>
          <Link href={`/dashboard`} className='flex items-center gap-1'>
            <Workflow className='text-primary' />
            <p className='hidden sm:block'>Dokflow</p>
          </Link>

          {/* These are replaced with breadcrumbs using react-portals */}
          <div id='projectName'></div>
          <div id='serviceName' className='-ml-2'></div>
          <div id='serverName' className='-ml-4'></div>
        </div>

        <div>
          <NavUser user={user} />
        </div>
      </div>

      {children}
    </div>
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
