import configPromise from '@payload-config'
import { env } from 'env'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { getTenant } from '@/lib/get-tenant'

const CLIENT_ID = env.DISCORD_CLIENT_ID
const CLIENT_SECRET = env.DISCORD_CLIENT_SECRET
const REDIRECT_URI = env.DISCORD_REDIRECT_URI

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
  }

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return NextResponse.json(
      { error: 'Missing Discord OAuth environment variables' },
      { status: 500 },
    )
  }

  const payload = await getPayload({ config: configPromise })

  // Exchange code for access token
  const data = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    scope: 'identify',
  })

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: data.toString(),
  })

  if (!tokenRes.ok) {
    return NextResponse.json(
      { error: 'Failed to get access token' },
      { status: 500 },
    )
  }

  const tokenJson = await tokenRes.json()
  const accessToken = tokenJson.access_token

  // Get user info
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!userRes.ok) {
    return NextResponse.json(
      { error: 'Failed to get user info' },
      { status: 500 },
    )
  }

  const discordUser = await userRes.json()

  // Get current logged-in user info & tenant from your auth/session
  const { userTenant, user } = await getTenant()

  if (!user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const avatarUrl = discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
    : null

  console.dir({ discordUser }, { depth: Infinity })
  console.dir({ id: discordUser.id }, { depth: Infinity })

  try {
    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        discord: {
          discordId: discordUser.id,
          discordUsername: discordUser.username,
          discordGlobalName: discordUser.global_name,
          discordAvatarUrl: avatarUrl,
          discordDiscriminator: discordUser.discriminator,
        },
      },
    })

    console.dir({ updatedUser }, { depth: Infinity })
  } catch (error) {
    console.error('Failed to update user with Discord info:', error)
    return NextResponse.json(
      { error: 'Failed to save Discord info' },
      { status: 500 },
    )
  }

  return NextResponse.redirect(
    new URL(`/${userTenant.tenant.slug}/dashboard`, request.url),
  )
}
