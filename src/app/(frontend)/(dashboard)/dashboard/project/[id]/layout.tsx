import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
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

  try {
    const { server } = await payload.findByID({
      collection: 'projects',
      id,
      select: {
        server: true,
      },
    })

    return <ClientLayout server={server}>{children}</ClientLayout>
  } catch (error) {
    notFound()
  }
}

export default ProjectIdLayout
