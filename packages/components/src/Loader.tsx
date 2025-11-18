import { Loader as LoaderIcon } from 'lucide-react'

import { cn } from '@dflow/lib/utils'

const Loader = ({ className = '' }: { className?: string }) => {
  return (
    <div
      role='status'
      className={cn('grid h-screen w-screen place-items-center', className)}>
      <LoaderIcon size={20} className='animate-spin' />
    </div>
  )
}

export default Loader
