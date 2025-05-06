import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import ClientLayout from './layout.client'

interface Props {
  params: Promise<{
    id: string
  }>
  children: React.ReactNode
}

const layout = async ({ children, params }: Props) => {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  const [project, projects] = await Promise.all([
    payload.findByID({
      collection: 'projects',
      id,
      depth: 10,
      select: {
        server: true,
        name: true,
      },
    }),
    payload.find({
      collection: 'projects',
      pagination: false,
      select: {
        name: true,
      },
    }),
  ])

  return (
    <ClientLayout
      project={{
        id: project.id,
        name: project.name,
      }}
      projects={projects.docs}
      server={project.server}>
      {children}
    </ClientLayout>
  )
}

export default layout
