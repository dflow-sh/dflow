'use client'

import { ThemeProvider } from 'next-themes'

import { Button } from '@dflow/core/components/ui/button'

import '@dflow/core/styles/globals.css'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.log({ error })

  return (
    <html>
      <body>
        <ThemeProvider enableSystem attribute='class'>
          <main className='flex min-h-screen w-full flex-col items-center justify-center'>
            <h2 className='text-primary text-6xl font-semibold'>500</h2>
            <p>Something went wrong!</p>

            <Button
              onClick={() => {
                reset()
              }}
              className='mt-4 w-max'>
              Try again
            </Button>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
