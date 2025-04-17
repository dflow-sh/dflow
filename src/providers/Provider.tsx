'use client'

import { ReactFlowProvider } from '@xyflow/react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import React from 'react'

import { SidebarProvider } from '@/components/ui/sidebar'

import RefreshProvider from './RefreshProvider'

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <NuqsAdapter>
        <SidebarProvider>
          <ReactFlowProvider>
            <RefreshProvider>{children}</RefreshProvider>
          </ReactFlowProvider>
        </SidebarProvider>
      </NuqsAdapter>
    </>
  )
}

export default Provider
