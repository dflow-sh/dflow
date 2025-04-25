'use client'

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
      size='sm'
      type='button'
      className='text-sm text-primary'>
      info
    </Button>
  )
}

export default SidebarToggleButton
