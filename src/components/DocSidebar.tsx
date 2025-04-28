'use client'

import { MDXContent } from '@content-collections/mdx/react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { docsAction } from '@/actions/docs'
import { useSidebarDocs } from '@/providers/SidebarDocsProvider'

import { InternalDocsSkeleton } from './skeletons/DocsSkeleton'
import { Button } from './ui/button'

const DocSidebar = () => {
  const { isOpen, close, directory, fileName, sectionId } = useSidebarDocs()
  const router = useRouter()

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
    hasSucceeded,
  } = useAction(docsAction)

  useEffect(() => {
    if (sectionId) {
      setTimeout(() => {
        router.push(sectionId)
      }, 500)
    }
  }, [hasSucceeded, sectionId])

  const { data: doc } = result

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? '100%' : 0 }}
      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
      className={`fixed right-0 top-0 z-[9999] h-full max-w-md overflow-y-scroll scroll-smooth bg-background pt-0 lg:static ${isOpen ? 'border-l' : ''}`}>
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

          <div className='prose prose-gray prose-invert h-full overflow-y-scroll p-4 prose-headings:scroll-mt-20'>
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
