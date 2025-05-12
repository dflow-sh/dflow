import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { getUserAction } from '@/actions/auth'
import Loader from '@/components/Loader'

const SuspenseLayout = async ({ children }: { children: React.ReactNode }) => {
  const userDetails = await getUserAction()
  const user = userDetails?.data

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
