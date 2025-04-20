'use client'

import { ReactFlowProvider } from '@xyflow/react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import React from 'react'

import { SidebarProvider } from '@/components/ui/sidebar'

import RefreshProvider from './RefreshProvider'
import { SidebarDocsProvider } from './SidebarDocsProvider'

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <NuqsAdapter>
        <SidebarProvider>
          <ReactFlowProvider>
            <RefreshProvider>
              <SidebarDocsProvider>{children}</SidebarDocsProvider>
            </RefreshProvider>
          </ReactFlowProvider>
        </SidebarProvider>
      </NuqsAdapter>
    </>
  )
}

export default Provider
