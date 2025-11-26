'use client'

import { Info } from 'lucide-react'

import { useSidebarDocs } from "@core/providers/SidebarDocsProvider"

import { Button } from "@core/components/ui/button"

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
      className='text-primary -my-4 text-sm'>
      <Info />
    </Button>
  )
}

export default SidebarToggleButton
