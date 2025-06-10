import { ServiceNode } from '../types'
import { Edge } from '@xyflow/react'

import { GitProvider, Service, Template } from '@/payload-types'

interface ServiceWithDisplayName extends Service {
  displayName: string
}
export function convertToGraph(
  services: Service[] | Template['services'] | ServiceWithDisplayName[],
) {
  if (!services || services.length === 0) {
    return { nodes: [], edges: [] }
  }
  const nodes: ServiceNode[] = services.map(item => {
    const deployments =
      'deployments' in item && item.deployments?.docs
        ? item.deployments?.docs.filter(
            deployment => typeof deployment === 'object',
          )
        : []
    const createdAt = 'createdAt' in item ? item.createdAt : ''

    const node: ServiceNode = {
      id: item.id!,
      name: item.name,
      type: item.type,
      displayName: 'displayName' in item ? item.displayName : undefined,
      description: item.description,
      variables: item.variables ?? undefined,
      ...(createdAt ? { createdAt } : {}),
      ...(deployments.length
        ? {
            deployments: deployments.map(deployment => ({
              id: deployment.id,
              status: deployment.status!,
            })),
          }
        : {}),
    }

    switch (item.type) {
      case 'database':
        node.databaseDetails = item.databaseDetails ?? undefined
        break
      case 'app':
        node.githubSettings = item.githubSettings ?? undefined
        node.builder = item.builder ?? undefined
        node.provider =
          typeof item.provider === 'object'
            ? (item.provider as GitProvider)?.id
            : item.provider === 'string'
              ? item.provider
              : undefined
        node.providerType = item.providerType ?? undefined
        break
      case 'docker':
        node.dockerDetails = item.dockerDetails ?? undefined
        break
      default:
        break
    }

    // console.log('Created node:', node)
    return node
  })

  const nameToIdMap = new Map(services.map(s => [s.name, s.id]))
  const edgeSet = new Set<string>()
  const edges: Edge[] = []

  const serviceNameRegex = /\{\{\s*([a-zA-Z0-9-_]+)\.([A-Z0-9_]+)\s*\}\}/

  services.forEach(service => {
    const sourceId = service.id!
    const envVars = service.variables ?? []

    envVars.forEach((env: any) => {
      if (typeof env.value === 'string') {
        const match = env.value.match(serviceNameRegex)
        if (match) {
          const targetName = match[1]
          const targetId = nameToIdMap.get(targetName)

          if (targetId && targetId !== sourceId) {
            const edgeId = `e-${sourceId}-${targetId}`

            if (!edgeSet.has(edgeId)) {
              edges.push({
                id: edgeId,
                source: sourceId,
                target: targetId,
              })
              edgeSet.add(edgeId)
            }
          }
        }
      }
    })
  })

  return { nodes, edges }
}
