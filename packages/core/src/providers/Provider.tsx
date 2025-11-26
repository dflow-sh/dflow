'use client'

import { ReactFlowProvider } from '@xyflow/react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import React from 'react'

import { ServersProvider } from "@core/providers/ServersProvider"
import { SidebarDocsProvider } from "@core/providers/SidebarDocsProvider"

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <NuqsAdapter>
        <ReactFlowProvider>
          <SidebarDocsProvider>
            <ServersProvider>{children}</ServersProvider>
          </SidebarDocsProvider>
        </ReactFlowProvider>
      </NuqsAdapter>
    </>
  )
}

export default Provider
