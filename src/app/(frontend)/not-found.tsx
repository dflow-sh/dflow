import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className='flex min-h-screen w-full flex-col items-center justify-center'>
      <h2 className='text-6xl font-semibold text-primary'>404</h2>
      <p>Sorry, the page you requested cannot be found.</p>

      <Button asChild className='mt-4 w-max'>
        <Link href='/' className='flex items-center gap-1'>
          <ArrowLeft />
          Return Home
        </Link>
      </Button>
    </section>
  )
}
