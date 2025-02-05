import { Loader } from 'lucide-react'
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/dashboard')

  return (
    <section className='grid h-full min-h-56 place-items-center'>
      <Loader className='animate-spin' size={20} />
    </section>
  )
}
