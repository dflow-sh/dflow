'use client'

import { MDXContent } from '@content-collections/mdx/react'
import { allApis, allIntroductions } from 'content-collections'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

import { useSidebarDocs } from '@/providers/SidebarDocsProvider'

import { Button } from './ui/button'

const allDocs = [...allApis, ...allIntroductions]

const DocSidebar = () => {
  const { isOpen, close: onClose } = useSidebarDocs()

  const doc = allDocs.find(d => d.categorySlug === 'getting-started')

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 450 : 0 }}
      transition={{ duration: 0.25 }}
      className='max-h-screen overflow-y-scroll border-l bg-background pt-0'>
      {isOpen && (
        <>
          <header className='sticky top-0 z-50 flex items-center justify-between border-b bg-background px-4 py-4'>
            <div className='font-medium'>Documentation</div>
            <Button variant='ghost' onClick={onClose} className='p-1'>
              <X size={16} className='stroke-muted-foreground p-0' />
            </Button>
          </header>

          <div className='prose prose-gray prose-invert overflow-scroll p-4'>
            <MDXContent code={doc?.mdx || ''} />
          </div>
        </>
      )}
    </motion.div>
  )
}

export default DocSidebar
