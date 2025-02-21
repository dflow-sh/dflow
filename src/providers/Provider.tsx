'use client'

import React from 'react'

import { SidebarProvider } from '@/components/ui/sidebar'

import { ServerTerminalProvider } from './ServerTerminalProvider'

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ServerTerminalProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </ServerTerminalProvider>
    </>
  )
}

export default Provider
