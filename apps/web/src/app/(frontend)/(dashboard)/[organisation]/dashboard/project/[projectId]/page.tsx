import React from 'react'

interface PageProps {
  params: Promise<{
    organisation: string
    projectId: string
  }>
}

const ProjectIdPage: React.FC<PageProps> = () => {
  return <></>
}

export default ProjectIdPage
