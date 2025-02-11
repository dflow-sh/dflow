import { Loader as LoaderIcon } from 'lucide-react'

const Loader = () => {
  return (
    <div role='status' className='grid h-screen w-screen place-items-center'>
      <LoaderIcon size={20} className='animate-spin' />
    </div>
  )
}

export default Loader
