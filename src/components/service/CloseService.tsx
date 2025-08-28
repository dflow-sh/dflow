'use client'

import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

const CloseService = ({
  organisation,
  projectId,
}: {
  organisation: string
  projectId: string
}) => {
  const router = useRouter()
  const handleClick = () => {
    router.replace(`/${organisation}/dashboard/project/${projectId}`)
  }
  return (
    <div
      title='close'
      onClick={handleClick}
      className='focus:ring-none text-base-content absolute right-4 top-4 cursor-pointer rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none'>
      <X className='h-4 w-4' />
      <span className='sr-only'>Close</span>
    </div>
  )
}

export default CloseService
