import { Geist, Geist_Mono } from 'next/font/google'
import React from 'react'

import ServerTerminal from '@/components/ServerTerminal'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
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
