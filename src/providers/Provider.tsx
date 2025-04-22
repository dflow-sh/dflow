'use client'

import { ReactFlowProvider } from '@xyflow/react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import React from 'react'

import RefreshProvider from './RefreshProvider'
import { SidebarDocsProvider } from './SidebarDocsProvider'

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <NuqsAdapter>
        <ReactFlowProvider>
          <RefreshProvider>
            <SidebarDocsProvider>{children}</SidebarDocsProvider>
          </RefreshProvider>
        </ReactFlowProvider>
      </NuqsAdapter>
    </>
  )
}

export default Provider
