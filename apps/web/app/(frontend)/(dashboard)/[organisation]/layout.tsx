import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React, { Suspense } from 'react'

import { getDflowUser } from '@dflow/actions/cloud/dFlow'
import { getGithubStarsAction } from '@dflow/actions/github'
import Banner from '@dflow/components/Banner'
import DocSidebar from '@dflow/components/DocSidebar'
import GithubStars from '@dflow/components/GithubStars'
import Logo from '@dflow/components/Logo'
import ToggleTheme from '@dflow/components/ToggleTheme'
import Bubble from '@dflow/components/bubble'
import { NavUser } from '@dflow/components/nav-user'
import { NavUserSkeleton } from '@dflow/components/skeletons/DashboardLayoutSkeleton'
import { Button } from '@dflow/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@dflow/components/ui/dialog'
import { DFLOW_CONFIG } from '@dflow/lib/constants'
import { getCurrentUser } from '@dflow/lib/getCurrentUser'
import BubbleProvider from '@dflow/providers/BubbleProvider'
import Provider from '@dflow/providers/Provider'
import TerminalProvider from '@dflow/providers/TerminalProvider'

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
  const result = await getGithubStarsAction()
  const dflowUser = await getDflowUser()
  const hasClaimedCredits = dflowUser?.data?.user?.hasClaimedFreeCredits
  const organisationSlug = (await params).organisation

  return (
    <div className='bg-background sticky top-0 z-50 w-full'>
      <div className='mx-auto flex w-full max-w-6xl items-center justify-between p-4'>
        <div className='flex min-h-9 items-center gap-2 text-2xl font-semibold'>
          <Link
            href={`/${organisationSlug}/dashboard`}
            className='flex items-center gap-1'>
            <Logo showText />
          </Link>

          {/* Breadcrumb placeholders */}
          <div id='projectName' />
          <div id='serviceName' className='-ml-2' />
          <div id='serverName' className='-ml-4' />
        </div>

        <div className='flex items-center gap-x-4'>
          <GithubStars githubStars={result?.data?.stars} />
          {/* <Link
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-muted-foreground hidden items-center gap-x-1 transition-colors duration-300 md:inline-flex'
            href='https://github.com/akhil-naidu/dflow'>
            <Github width='1.25em' height='1.25em' />{' '}
            <CountUp
              from={0}
              to={result?.data?.stars ?? 0}
              separator=','
              direction='up'
              duration={1}
              className='count-up-text'
            />
          </Link> */}

          {!hasClaimedCredits && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant={'ghost'}
                  size={'icon'}
                  className='hidden w-full p-1 md:block'>
                  <Image
                    src={'/images/gift.png'}
                    width={100}
                    height={100}
                    alt='gift-credits'
                    className='size-7'
                  />
                </Button>
              </DialogTrigger>

              <DialogContent>
                <div>
                  <Image
                    src={'/images/gift.png'}
                    width={100}
                    height={100}
                    alt='gift-credits'
                    className='mx-auto mb-2 size-14'
                  />
                  <DialogHeader>
                    <DialogTitle className='text-center text-xl'>
                      Claim your free credits!
                    </DialogTitle>
                    <DialogDescription className='mx-auto max-w-sm text-center'>
                      You can claim rewards by joining our Discord community.
                      Click on Claim Rewards to continue on{' '}
                      <a
                        className='text-foreground inline-flex items-center underline'
                        href={`${DFLOW_CONFIG.URL}/dashboard`}
                        target='_blank'
                        rel='noopener noreferrer'>
                        {DFLOW_CONFIG.DOMAIN}
                        <ArrowUpRight size={16} />
                      </a>
                    </DialogDescription>
                  </DialogHeader>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <ToggleTheme />

          <Suspense fallback={<NavUserSkeleton />}>
            <NavUserSuspended />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default async function OrganisationLayout({
  children,
  params,
}: PageProps) {
  return (
    <Provider>
      <TerminalProvider>
        <BubbleProvider>
          <Banner />
          <div className='relative flex h-screen w-full flex-col overflow-hidden'>
            {/* Main content area - will shrink when terminal is embedded */}
            <div
              id='main-content'
              className='flex flex-1 overflow-hidden transition-all duration-300'>
              <div className='flex-1 overflow-y-auto'>
                <DashboardLayoutInner params={params} />
                {children}
              </div>
              <DocSidebar />
            </div>

            {/* Terminal container - will be positioned at bottom */}
            <div id='embedded-terminal-container' />
          </div>
          <Bubble />
        </BubbleProvider>
      </TerminalProvider>
    </Provider>
  )
}
