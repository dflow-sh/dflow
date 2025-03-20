import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import ClientLayout from './layout.client'

interface PageProps {
  params: Promise<{
    id: string
  }>
  children: React.ReactNode
}

const ProjectIdLayout = async ({ children, params }: PageProps) => {
  const { id } = await params

  const payload = await getPayload({ config: configPromise })

  const { server } = await payload.findByID({
    collection: 'projects',
    id,
    select: {
      server: true,
    },
  })

  return <ClientLayout server={server}>{children}</ClientLayout>
}

export default ProjectIdLayout
