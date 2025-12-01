import { env } from '@dflow/core/env'
import { Fragment } from 'react'

import { borderRadius } from '@dflow/core/lib/constants'
import { fontType, getCSSAndLinkGoogleFonts, mimeTypes } from '@dflow/core/lib/googleFont'
import type { Theme as ThemeType } from '@dflow/core/payload-types'

type ThemeStylesType = {
  colors: ThemeType['lightMode']
  fontName: {
    display: string
    body: string
  }
  radius: ThemeType['radius']
}

// All the color variables are generated using generateThemeStyles function for light & dark mode
function generateThemeVariables({ colors, radius, fontName }: ThemeStylesType) {
  return `
      --primary: ${colors.primary};
      --primary-foreground: ${colors.primaryForeground};
      --secondary: ${colors.secondary};
      --secondary-foreground: ${colors.secondaryForeground};
      --accent: ${colors.accent};
      --accent-foreground: ${colors.accentForeground};
      --background: ${colors.background};
      --foreground: ${colors.foreground};
      --card: ${colors.card};
      --card-foreground: ${colors.cardForeground};
      --popover: ${colors.popover};
      --popover-foreground: ${colors.popoverForeground};
      --muted: ${colors.muted};
      --muted-foreground: ${colors.mutedForeground};
      --destructive: ${colors.destructive};
      --border: ${colors.border};
      --input: ${colors.input};
      --ring: ${colors.ring};
      --chart-1: ${colors.chart1};
      --chart-2: ${colors.chart2};
      --chart-3: ${colors.chart3};
      --chart-4: ${colors.chart4};
      --chart-5: ${colors.chart5};
      --sidebar: ${colors.sidebar};
      --sidebar-foreground: ${colors.sidebarForeground};
      --sidebar-primary: ${colors.sidebarPrimary};
      --sidebar-primary-foreground: ${colors.sidebarPrimaryForeground};
      --sidebar-accent: ${colors.sidebarAccent};
      --sidebar-accent-foreground: ${colors.sidebarAccentForeground};
      --sidebar-border: ${colors.sidebarBorder};
      --sidebar-ring: ${colors.sidebarRing};
      --font-display: ${fontName.display || ''};
      --font-body: ${fontName.body || ''};
      --border-radius: ${borderRadius[radius]};
  `
}

const Branding = async ({ theme }: { theme: ThemeType }) => {
  const { lightMode, darkMode, radius, fonts } = theme

  const displayFont =
    fonts.display.type === 'customFont'
      ? typeof fonts.display.customFont === 'object'
        ? {
            url: fonts.display.customFont?.url ?? '',
            format:
              mimeTypes[
                ((fonts.display?.customFont?.url ?? '').split('.')?.[1] ??
                  'otf') as keyof typeof mimeTypes
              ],
            fontName: 'Display',
          }
        : undefined
      : {
          googleFontURL: fonts.display.remoteFont ?? '',
          fontName: fonts.display.fontName ?? '',
        }

  const bodyFont =
    fonts.body.type === 'customFont'
      ? typeof fonts.body.customFont === 'object'
        ? {
            url: fonts.body.customFont?.url ?? '',
            format:
              mimeTypes[
                ((fonts.body?.customFont?.url ?? '').split('.')?.[1] ??
                  'otf') as keyof typeof mimeTypes
              ],
            fontName: 'Body',
          }
        : undefined
      : {
          googleFontURL: fonts.body.remoteFont ?? '',
          fontName: fonts.body.fontName ?? '',
        }

  const googleFontsList = [
    displayFont?.googleFontURL ?? '',
    bodyFont?.googleFontURL ?? '',
  ].filter(url => Boolean(url))

  const response = await getCSSAndLinkGoogleFonts({
    fontUrlList: googleFontsList,
  })

  const lightModeVariables = generateThemeVariables({
    colors: lightMode,
    fontName: {
      display: displayFont?.fontName ?? '',
      body: bodyFont?.fontName ?? '',
    },
    radius,
  })

  const darkModeVariables = generateThemeVariables({
    colors: darkMode,
    fontName: {
      display: displayFont?.fontName ?? '',
      body: bodyFont?.fontName ?? '',
    },
    radius,
  })

  return (
    <>
      {displayFont?.url && (
        <link
          rel='preload'
          href={`${env.NEXT_PUBLIC_WEBSITE_URL}${displayFont.url}`}
          as='font'
          type={displayFont.format}
          crossOrigin='anonymous'
        />
      )}

      {bodyFont?.url && (
        <link
          rel='preload'
          href={`${env.NEXT_PUBLIC_WEBSITE_URL}${bodyFont.url}`}
          as='font'
          type={bodyFont.format}
          crossOrigin='anonymous'
        />
      )}

      {/* If user uploads custom font setting styles of that font */}
      <style
        dangerouslySetInnerHTML={{
          __html: `${
            displayFont?.url
              ? `@font-face {
            font-family: 'Display';
            src: url(${env.NEXT_PUBLIC_WEBSITE_URL}${displayFont.url}) format(${fontType[displayFont.format]});
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }`
              : ''
          }\n
            ${
              bodyFont?.url
                ? `@font-face {
            font-family: 'Body';
            src: url(${env.NEXT_PUBLIC_WEBSITE_URL}${bodyFont.url}) format(${fontType[bodyFont.format]});
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }`
                : ''
            }`,
        }}
      />

      {/* Link & Style tags are created from googleFonts response */}
      {response.map(({ cssText, preloadLinks }, index) => (
        <Fragment key={index}>
          {preloadLinks.map(({ href, type }) =>
            href ? (
              <link
                rel='preload'
                as='font'
                crossOrigin='anonymous'
                href={href}
                type={type}
                key={href}
              />
            ) : null,
          )}
          <style dangerouslySetInnerHTML={{ __html: cssText }} />
        </Fragment>
      ))}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
            ${lightModeVariables}
            }
            \n
              .dark {
                ${darkModeVariables}
              }
            `,
        }}
      />
    </>
  )
}

export default Branding
