import { CollectionBeforeChangeHook } from 'payload'

export const checkServiceName: CollectionBeforeChangeHook = async ({
  data,
  req,
}) => {
  const { payload } = req

  const projectId = (
    typeof data.project === 'object' ? data.project.id : data.project
  ) as string

  const project = await payload.findByID({
    collection: 'projects',
    id: projectId,
    depth: 0,
    select: {
      name: true,
    },
  })

  if (project) {
    const projectName = project.name

    if (data.name && !data.name.startsWith(`${projectName}-`)) {
      data.name = `${projectName}-${data.name}`
    }
  }

  return data
}
