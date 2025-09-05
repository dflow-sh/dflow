'use client'

import { X } from 'lucide-react'
import Link from 'next/link'

const CloseService = ({
  organisation,
  projectId,
}: {
  organisation: string
  projectId: string
}) => {
  return (
    <Link
      href={`/${organisation}/dashboard/project/${projectId}`}
      title='close'
      className='focus:ring-none text-base-content absolute top-4 right-4 cursor-pointer rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none'>
      <X className='h-4 w-4' />
      <span className='sr-only'>Close</span>
    </Link>
  )
}

export default CloseService
