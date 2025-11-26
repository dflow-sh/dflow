import { getBranding, getTheme } from '@dflow/core/actions/branding'
import Branding from '@dflow/core/components/Branding'
import { Toaster } from '@dflow/core/components/ui/sonner'
import { BrandingProvider } from '@dflow/core/providers/BrandingProvider'
import { NetworkStatusProvider } from '@dflow/core/providers/NetworkStatusProvider'
import NProgressProvider from '@dflow/core/providers/NProgressProvider'
import '@dflow/core/styles/globals.css'
import React from 'react'
import { env } from 'env'
import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import { Geist_Mono } from 'next/font/google'
import Script from 'next/script'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export async function generateMetadata(): Promise<Metadata> {
  try {
    // calling the site-settings to get all the data
    const brandingData = await getBranding()
    const metadata = brandingData?.data

    const ogImageUrl =
      typeof metadata?.ogImage === 'object'
        ? metadata?.ogImage?.url!
        : '/images/seed/og-image.png'

    const faviconUrl =
      typeof metadata?.favicon === 'object' &&
      typeof metadata?.favicon?.lightMode === 'object'
        ? metadata?.favicon?.lightMode?.url!
        : '/images/favicon.ico'

    const title = {
      default: metadata?.title ?? '',
      template: `%s | ${metadata?.title}`,
    }

    const description = metadata?.description ?? ''
    const ogImage = [
      {
        url: `${ogImageUrl}`,
        height: 630,
        width: 1200,
        alt: `og image`,
      },
    ]

    return {
      title,
      description,
      // we're appending the http|https int the env variable
      metadataBase: env.NEXT_PUBLIC_WEBSITE_URL as unknown as URL,
      openGraph: {
        title,
        description,
        images: ogImage,
      },
      twitter: {
        title,
        description,
        images: ogImage,
      },
      keywords: metadata?.keywords ?? [],
      icons: {
        icon: faviconUrl,
        shortcut: faviconUrl,
        apple: faviconUrl,
      },
    }
  } catch (error) {
    // in error case returning a base metadata object
    console.log({ error })

    return {
      title: 'dFlow',
      description:
        'A self-hosted platform for deploying and managing applications, similar to Vercel, Railway, or Heroku. dFlow provides automated deployment workflows, container orchestration, and infrastructure management capabilities while giving you full control over your infrastructure and data.',
      icons: {
        icon: '/images/favicon.ico',
        shortcut: '/images/favicon.ico',
        apple: '/images/favicon.ico',
      },
    }
  }
}

export const viewport: Viewport = {
  themeColor: 'dark',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [themeData, brandingData] = await Promise.all([
    getTheme(),
    getBranding(),
  ])

  const theme = themeData?.data
  const branding = brandingData?.data

  return (
    // todo: add next-themes support, add context to pass logo url to client-components
    <html lang='en' suppressHydrationWarning>
      <head>
        {/* Added react-scan for fixing performance pit-holes */}
        {/* {process.env.NODE_ENV === 'development' && (
          <script
            crossOrigin='anonymous'
            async
            src='//unpkg.com/react-scan/dist/auto.global.js'
          />
        )} */}

        <script
          id='chatway'
          async
          src='https://cdn.chatway.app/widget.js?id=J34Fw4u1288m'
        />

        {/* Headway Widget Configuration */}
        <script
          id='headway-config'
          dangerouslySetInnerHTML={{
            __html: `
              var HW_config = {
                selector: ".headway-notifications", // CSS selector where to inject the badge
                account: "xWqgrJ",
                trigger: ".headway-trigger" // Optional: external trigger for opening the widget
              }
            `,
          }}
        />

        {theme && <Branding theme={theme} />}
      </head>

      <body className={`overflow-y-hidden ${geistMono.variable}`}>
        <NProgressProvider>
          {/* <PosthogProvider> */}
          {/* <SuspendedPostHogPageView /> */}
          <NetworkStatusProvider>
            <ThemeProvider enableSystem attribute='class'>
              <BrandingProvider branding={branding}>
                {children}
              </BrandingProvider>
              <Toaster
                richColors
                duration={3000}
                closeButton
                position='top-right'
                pauseWhenPageIsHidden
                visibleToasts={5}
              />
            </ThemeProvider>
          </NetworkStatusProvider>
          {/* </PosthogProvider> */}
        </NProgressProvider>

        {/* Headway Widget Script - loaded after body */}
        <Script
          src='https://cdn.headwayapp.co/widget.js'
          strategy='lazyOnload'
        />
      </body>
    </html>
  )
}
