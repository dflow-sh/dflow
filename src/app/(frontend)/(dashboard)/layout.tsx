import configPromise from '@payload-config'
import { ArrowUpRight } from 'lucide-react'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { HeaderBanner } from '@/components/HeaderBanner'
import { NavUser } from '@/components/nav-user'
import { isDemoEnvironment } from '@/lib/constants'
import Provider from '@/providers/Provider'

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: headersList })
  const { totalDocs } = await payload.count({
    collection: 'users',
    where: {
      onboarded: {
        equals: true,
      },
    },
  })

  // Redirecting user to sign-in if user is not signed in
  if (!user) {
    redirect('/sign-in')
  }

  if (!user.onboarded && totalDocs === 0) {
    redirect('/onboarding')
  }

  return (
    <div className='w-full'>
      <div className='sticky top-0 z-50 w-full bg-background'>
        {isDemoEnvironment && <HeaderBanner />}
        <div className='mx-auto flex w-full max-w-6xl items-center justify-between p-4'>
          <div className='flex min-h-9 items-center gap-2 text-2xl font-semibold'>
            <Link href={`/dashboard`} className='flex items-center gap-1'>
              {/* <Workflow className='text-primary' /> */}

              <Image
                src='/images/dflow-no-bg.png'
                alt='dFlow-logo'
                width={32}
                height={32}
                className='object-contain'
              />
              <p className='hidden sm:block'>dFlow</p>
            </Link>

            {/* These are replaced with breadcrumbs using react-portals */}
            <div id='projectName'></div>
            <div id='serviceName' className='-ml-2'></div>
            <div id='serverName' className='-ml-4'></div>
          </div>

          <div className='flex items-center gap-x-4'>
            <Link
              className='flex items-center text-sm hover:text-primary hover:underline'
              href={'https://dFlow.sh/changelog'}
              target='_blank'>
              <span>Changelog</span>
              <ArrowUpRight size={16} />
            </Link>
            <NavUser user={user} />
          </div>
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
      {/* <Suspense fallback={<></>}> */}
      <DashboardLayout>{children}</DashboardLayout>
      {/* </Suspense> */}
    </Provider>
  )
}
