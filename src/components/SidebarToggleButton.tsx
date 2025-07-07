'use client'

import { Info } from 'lucide-react'

import { useSidebarDocs } from '@/providers/SidebarDocsProvider'

import { Button } from './ui/button'

const SidebarToggleButton = ({
  directory,
  fileName,
  sectionId,
}: {
  directory: string
  fileName: string
  sectionId?: string
}) => {
  const { openWith } = useSidebarDocs()

  return (
    <Button
      onClick={() => openWith({ directory, fileName, sectionId })}
      variant='link'
      size='icon'
      type='button'
      className='text-sm text-primary'>
      <Info />
    </Button>
  )
}

export default SidebarToggleButton
