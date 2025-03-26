import configPromise from '@payload-config'
import { getPayload } from 'payload'
import 'server-only'

export const updateDeploymentStatus = async ({
  deployment,
}: {
  deployment: {
    id: string
    status: 'queued' | 'success' | 'failed' | 'building'
    logs: string[]
  }
}) => {
  const payload = await getPayload({ config: configPromise })

  const deploymentResponse = await payload.update({
    collection: 'deployments',
    data: {
      status: deployment.status,
      logs: deployment.logs,
    },
    id: deployment.id,
  })

  return deploymentResponse
}
