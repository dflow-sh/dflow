'use client'

import { useSidebarDocs } from '@/providers/SidebarDocsProvider'

import { Button } from './ui/button'

const SidebarToggleButton = ({ slug }: { slug: string }) => {
  const { openWith, isOpen } = useSidebarDocs()

  return (
    <Button onClick={() => openWith(slug)} variant='outline' size='sm'>
      {isOpen ? 'Hide Docs' : 'Show Docs'}
    </Button>
  )
}

export default SidebarToggleButton
