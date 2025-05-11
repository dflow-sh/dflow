import React from 'react'

import { getProjectBreadcrumbs } from '@/actions/pages/project'
import { Project, Server } from '@/payload-types'

import ClientLayout from './layout.client'

interface Props {
  params: Promise<{
    id: string
  }>
  children: React.ReactNode
}

const layout = async ({ children, params }: Props) => {
  const { id } = await params
  const result = await getProjectBreadcrumbs({ id })

  const project = result?.data?.project?.docs?.at(0)
  return (
    <ClientLayout
      project={{
        id: project?.id!,
        name: project?.name!,
      }}
      projects={result?.data?.projects?.docs as Project[]}
      server={project?.server as Server}>
      {children}
    </ClientLayout>
  )
}

export default layout
