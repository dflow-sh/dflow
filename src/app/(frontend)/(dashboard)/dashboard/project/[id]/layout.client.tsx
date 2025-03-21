'use client'

import React from 'react'

import ProjectTerminal from '@/components/project/ProjectTerminal'
import { Server } from '@/payload-types'

const ClientLayout = ({
  children,
  server,
}: {
  children: React.ReactNode
  server: Server | string
}) => {
  return (
    <>
      {children}

      {typeof server === 'object' && <ProjectTerminal server={server} />}
    </>
  )
}

export default ClientLayout
