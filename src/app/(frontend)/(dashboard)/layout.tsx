import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

import Loader from '@/components/Loader'
import ServerTerminal from '@/components/ServerTerminal'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { ServerTerminalProvider } from '@/providers/ServerTerminalProvider'

const SuspenseLayout = async ({ children }: { children: React.ReactNode }) => {
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: headersList })

  // Redirecting user to sign-in if user is not signed in
  if (!user) {
    return redirect('/sign-in')
  }

  return (
    <ServerTerminalProvider>
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          <main className='mt-4 px-4'>{children}</main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster richColors />

      <ServerTerminal />
    </ServerTerminalProvider>
  )
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    // Added a suspense boundary to show loading response until user promise is resolved
    <Suspense fallback={<Loader />}>
      <SuspenseLayout>{children}</SuspenseLayout>
    </Suspense>
  )
}
