import { Button } from '@dflow/core/components/ui/button'
import '@dflow/core/styles/globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
}

export default function GlobalNotFound() {
  return (
    <html>
      <body>
        <ThemeProvider enableSystem attribute='class'>
          <main className='flex min-h-screen w-full flex-col items-center justify-center'>
            <h2 className='text-primary text-6xl font-semibold'>404</h2>
            <p>Sorry, the page you requested cannot be found.</p>

            <Button className='mt-4 w-max'>
              <Link href='/'>Back To Dashboard</Link>
            </Button>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
