import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

import Loader from '@/components/Loader'
import Provider from '@/providers/Provider'

const OnboardingLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
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

  if (user.onboarded || totalDocs > 0) {
    redirect('/dashboard')
  }

  return children
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    // Added a suspense boundary to show loading response until user promise is resolved
    <Provider>
      <Suspense fallback={<Loader />}>
        <OnboardingLayout>{children}</OnboardingLayout>
      </Suspense>
    </Provider>
  )
}
