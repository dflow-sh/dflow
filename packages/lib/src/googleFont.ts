export const mimeTypes = {
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf',
  eot: 'application/vnd.ms-fontobject',
  svg: 'image/svg+xml',
} as const

export const fontType = {
  'font/otf': 'opentype',
  'font/ttf': 'truetype',
  'font/woff': 'woff',
  'font/woff2': 'woff2',
  'application/vnd.ms-fontobject': 'embedded-opentype',
  'image/svg+xml': 'svg',
} as const

export type FontPreloadAttributes = {
  href: string
  type: keyof typeof mimeTypes | string
}

export type ExtractedListType = {
  preloadLinks: FontPreloadAttributes[]
  cssText: string
}

export const getFontMimeType = (url: string) => {
  const ext = url.split('.').pop() as keyof typeof mimeTypes // Get the file extension
  return mimeTypes[ext] || 'font/woff2'
}

export const fetchGoogleFonts = async (fontUrl: string) => {
  try {
    const response = await fetch(fontUrl)
    const cssText = await response.text()

    // Extract font URLs
    const fontUrls = Array.from(cssText.matchAll(/url\(([^)]+)\)/g)).map(
      match => match[1].replace(/['"]+/g, ''), // Clean up the URL
    )

    // Generate preload links as attribute objects
    const preloadLinks = fontUrls.map(url => ({
      href: url,
      type: getFontMimeType(url),
    }))

    return { preloadLinks, cssText }
  } catch (error) {
    console.error('Failed to load Google Fonts:', error)
    return {
      preloadLinks: [
        {
          href: '',
          type: '',
        },
      ],
      cssText: '',
    }
  }
}

export const getCSSAndLinkGoogleFonts = async ({
  fontUrlList,
}: {
  fontUrlList: string[]
}) => {
  const list: ExtractedListType[] = []

  for await (const fontURL of fontUrlList) {
    const { preloadLinks, cssText } = await fetchGoogleFonts(fontURL)
    list.push({ preloadLinks, cssText })
  }

  return list
}
