import { Webhooks } from '@octokit/webhooks'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { triggerDeployment } from '@/actions/deployment/deploy'

export async function POST(request: Request) {
  const headers = request.headers
  const body = await request.json()
  const payload = await getPayload({ config: configPromise })
  const signature = headers.get('x-hub-signature-256')
  const event = headers.get('x-github-event')
  const installationId = body.installation?.id
  const branchName = body?.ref?.replace('refs/heads/', '')
  const repositoryName = body?.repository?.name

  if (!installationId) {
    return Response.json(
      {
        message: 'Github-app installation not done',
      },
      {
        status: 400,
      },
    )
  }

  const { docs } = await payload.find({
    collection: 'gitProviders',
    where: {
      'github.installationId': {
        equals: installationId,
      },
    },
  })

  const githubAppDetails = docs?.[0]

  if (!githubAppDetails?.id) {
    return Response.json(
      {
        message: 'Github-app not found',
      },
      {
        status: 404,
      },
    )
  }

  if (!signature) {
    return Response.json(
      {
        message: 'Signature not found',
      },
      {
        status: 404,
      },
    )
  }

  const webhooks = new Webhooks({
    secret: githubAppDetails.github?.webhookSecret,
  })

  const verified = await webhooks.verify(JSON.stringify(body), signature)

  if (!verified) {
    return Response.json(
      {
        message: 'Unauthenticated',
      },
      {
        status: 401,
      },
    )
  }

  const { docs: services } = await payload.find({
    collection: 'services',
    where: {
      and: [
        {
          'githubSettings.branch': {
            equals: branchName,
          },
        },
        {
          'githubSettings.repository': {
            equals: repositoryName,
          },
        },
      ],
    },
  })

  console.dir(
    { body, signature, verified, services, event },
    { depth: Infinity },
  )

  if (event === 'push') {
    for await (const service of services) {
      await triggerDeployment({ serviceId: service.id })
    }
  }

  return Response.json(
    {
      message: 'Response received',
    },
    {
      status: 200,
    },
  )
}
