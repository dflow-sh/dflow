'use client'

import { ChevronsUp, HardDrive, SquareTerminal } from 'lucide-react'
import React, { useState } from 'react'

import ProjectTerminal from '@/components/project/ProjectTerminal'
import { Badge } from '@/components/ui/badge'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { Server } from '@/payload-types'

const ClientLayout = ({
  children,
  server,
}: {
  children: React.ReactNode
  server: Server | string
}) => {
  const [open, setOpen] = useState(false)
  const { state } = useSidebar()

  return (
    <>
      {children}

      {typeof server === 'object' && (
        <>
          <div
            tabIndex={0}
            role='button'
            onClick={() => setOpen(true)}
            className={cn(
              'fixed bottom-0 right-0 flex w-full items-center justify-between border-t bg-secondary/50 px-3 py-2 backdrop-blur-lg transition-[width] duration-200 ease-linear hover:bg-secondary/70',
              state === 'expanded'
                ? 'md:w-[calc(100%-var(--sidebar-width))]'
                : 'md:w-[calc(100%-var(--sidebar-width-icon))]',
            )}>
            <div className='flex items-center gap-2 text-sm'>
              <SquareTerminal size={16} /> Console{' - '}
              <Badge variant={'secondary'}>
                <div className='flex items-center gap-x-2'>
                  <HardDrive size={16} />
                  <span className='text-sm font-medium'>{server.name}</span>
                </div>
              </Badge>
            </div>

            <ChevronsUp size={20} />
          </div>

          <ProjectTerminal server={server} open={open} setOpen={setOpen} />
        </>
      )}
    </>
  )
}

export default ClientLayout
