'use client'

import { ReactFlowProvider } from '@xyflow/react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import React from 'react'

import RefreshProvider from '@/providers/RefreshProvider'

import { SidebarDocsProvider } from './SidebarDocsProvider'

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <NuqsAdapter>
        <ReactFlowProvider>
          <SidebarDocsProvider>
            <RefreshProvider>{children}</RefreshProvider>
          </SidebarDocsProvider>
        </ReactFlowProvider>
      </NuqsAdapter>
    </>
  )
}

export default Provider
