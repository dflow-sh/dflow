import { Geist, Geist_Mono } from 'next/font/google'
import React from 'react'
import { Toaster } from 'sonner'

import NProgressProvider from '@/providers/NProgressProvider'
import { NetworkStatusProvider } from '@/providers/NetworkStatusProvider'
import SuspendedPostHogPageView from '@/providers/PosthogPageView'
import PosthogProvider from '@/providers/PosthogProvider'

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
  title: 'dFlow',
  description:
    'A self-hosted platform for deploying and managing applications, similar to Vercel, Railway, or Heroku. dFlow provides automated deployment workflows, container orchestration, and infrastructure management capabilities while giving you full control over your infrastructure and data.',
  icons: {
    icon: '/images/favicon.ico',
    shortcut: '/images/favicon.ico',
    apple: '/images/favicon.ico',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NH2BJRRR');`,
          }}
        />
        {/* End Google Tag Manager */}

        {/* Added react-scan for fixing performance pit-holes */}
        {/* {process.env.NODE_ENV === 'development' && (
          <script
            crossOrigin='anonymous'
            async
            src='//unpkg.com/react-scan/dist/auto.global.js'
          />
        )} */}
      </head>
      <body className={`${geistSans.className} ${geistMono.variable}`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src='https://www.googletagmanager.com/ns.html?id=GTM-NH2BJRRR'
            height='0'
            width='0'
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <NProgressProvider>
          <PosthogProvider>
            <SuspendedPostHogPageView />
            <NetworkStatusProvider>{children}</NetworkStatusProvider>
          </PosthogProvider>
          <Toaster richColors theme='dark' duration={3000} closeButton />
        </NProgressProvider>
      </body>
    </html>
  )
}
