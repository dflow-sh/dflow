'use client'

import { useEffect, useState } from 'react'
import { allDocs } from '@web/docs'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { InternalDocsSkeleton } from '@dflow/core/components/skeletons/DocsSkeleton'
import { Button } from '@dflow/core/components/ui/button'
import { useSidebarDocs } from '@dflow/core/providers/SidebarDocsProvider'

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

type Doc = {
  html: string
  _meta: {
    fileName: string
  }
}

const DocSidebar = () => {
  const { isOpen, close, directory, fileName, sectionId } = useSidebarDocs()
  const router = useRouter()
  const [doc, setDoc] = useState<Doc | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && directory && fileName) {
      setIsLoading(true)

      try {
        const docs = allDocs[directory as keyof typeof allDocs]

        if (!docs) {
          console.error('Documentation not found')
          setDoc(null)
          setIsLoading(false)
          return
        }

        const docFile = docs.find(d => d._meta.fileName === `${fileName}.md`)

        if (!docFile) {
          console.error('Document file not found')
          setDoc(null)
          setIsLoading(false)
          return
        }

        setDoc(docFile as Doc)
      } catch (error) {
        console.error('Error loading doc:', error)
        setDoc(null)
      } finally {
        setIsLoading(false)
      }
    }
  }, [directory, fileName, isOpen])

  useEffect(() => {
    if (sectionId && doc) {
      setTimeout(() => {
        // Use window.location for hash navigation instead of router.push
        if (sectionId.startsWith('#')) {
          window.location.hash = sectionId
        } else {
          // If it's a full path, cast to any to bypass typed routes
          router.push(sectionId as any)
        }
      }, 500)
    }
  }, [doc, sectionId, router])

  return (
    <AnimatePresence mode='wait'>
      {isOpen && (
        <motion.div
          variants={variants}
          initial={'initial'}
          exit='initial'
          animate={isOpen ? 'animate' : 'initial'}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          className={`bg-background z-9999 fixed right-0 top-0 h-full max-w-md overflow-y-scroll scroll-smooth pt-0 lg:static ${isOpen ? 'border-l' : ''}`}>
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
            {isLoading ? (
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
