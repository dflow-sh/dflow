import { dFlowRestSdk } from '../restSDK/utils'

import { Service } from '@/payload-types'

type TemplateType = {
  name: string
  description: string
  services: Service[]
}

export async function fetchOfficialTemplateByName({
  name = '',
}: {
  name: string
}) {
  const { docs: templates } = await dFlowRestSdk.find({
    collection: 'templates',
    pagination: false,
    where: {
      and: [
        {
          name: { equals: name },
        },
        {
          type: { equals: 'official' },
        },
      ],
    },
  })

  const template = templates[0]
  if (!template) return undefined

  return {
    name: template.name,
    description: template.description,
    services: (template.services ?? []) as Service[],
  } as TemplateType
}
