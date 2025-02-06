import { Geist, Geist_Mono } from 'next/font/google'
import React from 'react'

import { DynamicBreadcrumbs } from '@/components/DynamicBreadcrumbs'
import ServerTerminal from '@/components/ServerTerminal'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { ServerTerminalProvider } from '@/providers/ServerTerminalProvider'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: 'DFlow',
  description:
    'A self-hosted platform for deploying and managing applications, similar to Vercel, Railway, or Heroku. DFlow provides automated deployment workflows, container orchestration, and infrastructure management capabilities while giving you full control over your infrastructure and data.',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang='en'>
      <head>
        {/* Added react-scan for fixing performance pit-holes */}
        <script
          crossOrigin='anonymous'
          src='//unpkg.com/react-scan/dist/auto.global.js'
        />
      </head>
      <body className={`${geistSans.className} ${geistMono.variable}`}>
        <ServerTerminalProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
                <div className='flex items-center gap-2 px-4'>
                  <SidebarTrigger className='-ml-1' />
                  <Separator orientation='vertical' className='mr-2 h-4' />
                  <DynamicBreadcrumbs />
                </div>
              </header>

              <main className='px-4'>{children}</main>
            </SidebarInset>
          </SidebarProvider>
          <Toaster richColors />

          <ServerTerminal />
        </ServerTerminalProvider>
      </body>
    </html>
  )
}
