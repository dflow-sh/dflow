'use client'

import { MDXContent } from '@content-collections/mdx/react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect } from 'react'

import { docsAction } from '@/actions/docs'
import { useSidebarDocs } from '@/providers/SidebarDocsProvider'

import { InternalDocsSkeleton } from './skeletons/DocsSkeleton'
import { Button } from './ui/button'

const DocSidebar = () => {
  const { isOpen, close, directory, fileName } = useSidebarDocs()

  useEffect(() => {
    if (isOpen && directory && fileName) {
      executeDocs({
        directory,
        fileName,
      })
    }
  }, [directory, fileName, isOpen])

  const {
    execute: executeDocs,
    result,
    isPending: isDocsPending,
  } = useAction(docsAction)

  const { data: doc } = result

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? '100%' : 0 }}
      transition={{ duration: 0.25 }}
      className='fixed right-0 top-0 z-[9999] h-full max-w-md overflow-y-scroll border-l bg-background pt-0 lg:static'>
      {isOpen && (
        <>
          <header className='sticky top-0 z-50 flex items-center justify-between border-b bg-background px-4 py-4'>
            <div className='font-medium'>Documentation</div>
            <Button
              variant='link'
              onClick={close}
              className='p-1 hover:no-underline'>
              <X size={16} className='stroke-muted-foreground p-0' />
            </Button>
          </header>

          <div className='prose prose-gray prose-invert overflow-scroll p-4'>
            {isDocsPending ? (
              <InternalDocsSkeleton />
            ) : doc ? (
              <MDXContent code={doc.mdx || ''} />
            ) : (
              <div className='text-center'>No documentation found</div>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}

export default DocSidebar
