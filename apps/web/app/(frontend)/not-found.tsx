// Import global styles and fonts
import { Button } from '@dflow/components/ui/button'
import { ThemeProvider } from 'next-themes'
import Link from 'next/link'

import './globals.css'

export default function NotFound() {
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
