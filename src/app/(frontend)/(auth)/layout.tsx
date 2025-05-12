import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import { getCurrentUser } from '@/lib/getCurrentUser'

const SuspenseLayout = async ({ children }: { children: React.ReactNode }) => {
  const headersList = await headers()
  // const payload = await getPayload({ config: configPromise })

  const user = await getCurrentUser(headersList)

  // Redirecting user to sign-in if user is not signed in
  if (user) {
    return redirect(`/${user.username}/dashboard`)
  }

  return <>{children}</>
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<Loader />}>
      <SuspenseLayout>{children}</SuspenseLayout>
    </Suspense>
  )
}
