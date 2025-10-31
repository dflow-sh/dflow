import { ThemeProvider } from 'next-themes'
import Link from 'next/link'

import '@/app/(frontend)/globals.css'
import { Button } from '@/components/ui/button'

export default function Forbidden() {
  return (
    <ThemeProvider enableSystem attribute='class'>
      <main className='flex min-h-screen w-full flex-col items-center justify-center'>
        <h2 className='text-primary text-6xl font-semibold'>403</h2>
        <p>You do not have permission to access this resource.</p>

        <Button className='mt-4 w-max'>
          <Link href='/'>Back To Dashboard</Link>
        </Button>
      </main>
    </ThemeProvider>
  )
}
