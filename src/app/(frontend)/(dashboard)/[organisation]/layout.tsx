import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React, { Suspense } from 'react'

import { getGithubStarsAction } from '@/actions/github'
import Banner from '@/components/Banner'
import DocSidebar from '@/components/DocSidebar'
import { GithubSvg } from '@/components/icons/Github'
import { NavUser } from '@/components/nav-user'
import { NavUserSkeleton } from '@/components/skeletons/DashboardLayoutSkeleton'
import { getCurrentUser } from '@/lib/getCurrentUser'
import Provider from '@/providers/Provider'

interface PageProps {
  params: Promise<{
    organisation: string
  }>
  children: React.ReactNode
}

const NavUserSuspended = async () => {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return <NavUser user={user} />
}

const DashboardLayoutInner = async ({
  params,
}: {
  params: PageProps['params']
}) => {
  const organisationSlug = (await params).organisation

  const result = await getGithubStarsAction()

  return (
    <div className='sticky top-0 z-50 w-full bg-background'>
      <div className='mx-auto flex w-full max-w-6xl items-center justify-between p-4'>
        <div className='flex min-h-9 items-center gap-2 text-2xl font-semibold'>
          <Link
            href={`/${organisationSlug}/dashboard`}
            className='flex items-center gap-1'>
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
          <div id='serviceName' className='-ml-2' />
          <div id='serverName' className='-ml-4' />
        </div>

        <div className='flex items-center gap-x-4'>
          <Link
            target='_blank'
            className='inline-flex items-center gap-x-1 transition-colors duration-300 hover:text-muted-foreground'
            href='https://github.com/akhil-naidu/dflow'>
            <GithubSvg width='1.25em' height='1.25em' />{' '}
            {result?.data?.stars ? result?.data?.stars : 0}
          </Link>

          <Suspense fallback={<NavUserSkeleton />}>
            <NavUserSuspended />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

const DashboardLayout = ({ children, params }: PageProps) => {
  return (
    <div className='relative flex h-screen w-full overflow-hidden'>
      <div className='flex-1 overflow-y-auto'>
        <DashboardLayoutInner params={params} />
        {children}
      </div>

      <DocSidebar />
    </div>
  )
}

export default async function OrganisationLayout({
  children,
  params,
}: PageProps) {
  return (
    <Provider>
      <Banner />
      <DashboardLayout params={params}>{children}</DashboardLayout>
    </Provider>
  )
}
