import configPromise from '@payload-config'
import { ArrowUpRight } from 'lucide-react'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React, { Suspense, use } from 'react'

import { HeaderBanner } from '@/components/HeaderBanner'
import { NavUser } from '@/components/nav-user'
import { DashboardHeaderSkeleton } from '@/components/skeletons/DashbaordLayoutSkeleton'
import { isDemoEnvironment } from '@/lib/constants'
import Provider from '@/providers/Provider'

const DashboardLayoutInner = () => {
  const [userData, totalUsers] = use(
    Promise.all([
      (async () => {
        const payload = await getPayload({ config: configPromise })
        const headersList = await headers()
        const { user } = await payload.auth({ headers: headersList })
        return { user, payload }
      })(),
      getPayload({ config: configPromise }).then(payload =>
        payload.count({
          collection: 'users',
          where: { onboarded: { equals: true } },
        }),
      ),
    ]),
  )

  const { user, payload } = userData
  const { totalDocs } = totalUsers

  if (!user) redirect('/sign-in')
  if (!user.onboarded && totalDocs === 0) redirect('/onboarding')

  return (
    <div className='sticky top-0 z-50 w-full bg-background'>
      {isDemoEnvironment && <HeaderBanner />}
      <div className='mx-auto flex w-full max-w-6xl items-center justify-between p-4'>
        <div className='flex min-h-9 items-center gap-2 text-2xl font-semibold'>
          <Link href={`/dashboard`} className='flex items-center gap-1'>
            <Image
              src='/images/dflow-no-bg.png'
              alt='dFlow-logo'
              width={32}
              height={32}
              className='object-contain'
            />
            <p className='hidden sm:block'>dFlow</p>
          </Link>

          {/* Breadcrumb placeholders */}
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
  )
}

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='w-full'>
      <Suspense fallback={<DashboardHeaderSkeleton />}>
        <DashboardLayoutInner />
      </Suspense>
      {children}
    </div>
  )
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Provider>
      <DashboardLayout>{children}</DashboardLayout>
    </Provider>
  )
}
