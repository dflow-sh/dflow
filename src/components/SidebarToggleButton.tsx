'use client'

import { useSidebarDocs } from '@/providers/SidebarDocsProvider'

import { Button } from './ui/button'

const SidebarToggleButton = ({
  directory,
  fileName,
}: {
  directory: string
  fileName: string
}) => {
  const { openWith } = useSidebarDocs()

  return (
    <Button
      onClick={() => openWith({ directory, fileName })}
      variant='link'
      size='sm'
      className='text-sm text-primary'>
      info
    </Button>
  )
}

export default SidebarToggleButton
