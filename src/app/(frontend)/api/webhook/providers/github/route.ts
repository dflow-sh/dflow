import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from 'octokit'
import { getPayload } from 'payload'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const payload = await getPayload({ config: configPromise })
  const code = searchParams.get('code') ?? ''
  const installation_id = searchParams.get('installation_id') ?? ''
  const onboarding = searchParams.get('onboarding') ?? ''
  const state = searchParams.get('state') ?? ''

  if (!state) {
    return NextResponse.json(
      {
        message: 'Invalid request!',
      },
      {
        status: 400,
      },
    )
  }

  console.log({
    code,
    installation_id,
    state,
  })

  const [action, id] = state.split(':')

  if (action === 'gh_init') {
    const octokit = new Octokit({})
    const { data } = await octokit.request(
      'POST /app-manifests/{code}/conversions',
      {
        code: code as string,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    )

    const setupResponse = await payload.create({
      collection: 'gitProviders',
      data: {
        type: 'github',
        github: {
          appId: data.id,
          appName: data.name,
          appUrl: data.html_url,
          clientId: data.client_id,
          clientSecret: data.client_secret,
          webhookSecret: data.webhook_secret ?? '',
          privateKey: data.pem,
        },
      },
    })

    console.log({ setupResponse })
  } else if (action === 'gh_install') {
    const installationResponse = await payload.update({
      collection: 'gitProviders',
      id,
      data: {
        github: {
          installationId: installation_id,
        },
      },
    })

    console.log({ installationResponse })
  }

  if (onboarding === 'true') {
    redirect('/onboarding/install-github')
  }

  return redirect('/settings/git')
}
