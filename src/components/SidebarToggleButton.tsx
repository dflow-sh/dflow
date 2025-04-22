'use client'

import { useSidebarDocs } from '@/providers/SidebarDocsProvider'

import { Button } from './ui/button'

const SidebarToggleButton = ({ slug }: { slug: string }) => {
  const { openWith } = useSidebarDocs()

  return (
    <Button
      onClick={() => openWith(slug)}
      variant='link'
      size='sm'
      className='text-sm text-primary'>
      info
    </Button>
  )
}

export default SidebarToggleButton
