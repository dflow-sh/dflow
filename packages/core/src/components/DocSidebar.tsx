'use client'

import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { docsAction } from "@core/actions/docs"
import { useSidebarDocs } from "@core/providers/SidebarDocsProvider"

import { InternalDocsSkeleton } from "@core/components/skeletons/DocsSkeleton"
import { Button } from "@core/components/ui/button"

const variants = {
  initial: {
    width: 0,
    opacity: 0,
  },
  animate: {
    width: '100%',
    opacity: 1,
  },
}

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
    <AnimatePresence mode='wait'>
      {isOpen && (
        <motion.div
          variants={variants}
          initial={'initial'}
          exit='initial'
          animate={isOpen ? 'animate' : 'initial'}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          className={`bg-background fixed top-0 right-0 z-9999 h-full max-w-md overflow-y-scroll scroll-smooth pt-0 lg:static ${isOpen ? 'border-l' : ''}`}>
          <header className='bg-background sticky top-0 z-50 flex items-center justify-between border-b px-4 py-4'>
            <div className='font-medium'>Documentation</div>
            <Button
              variant='link'
              onClick={close}
              className='p-1 hover:no-underline'>
              <X size={16} className='stroke-muted-foreground p-0' />
            </Button>
          </header>

          <div className='prose prose-gray dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-primary prose-headings:font-medium prose-headings:text-foreground h-full overflow-y-scroll p-4'>
            {isDocsPending ? (
              <InternalDocsSkeleton />
            ) : doc ? (
              <div dangerouslySetInnerHTML={{ __html: doc.html }} />
            ) : (
              <div className='text-center'>No documentation found</div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default DocSidebar
