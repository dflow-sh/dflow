import { env } from 'env'
import { NextResponse } from 'next/server'

export async function GET() {
  const CLIENT_ID = env.DISCORD_CLIENT_ID
  const REDIRECT_URI = env.DISCORD_REDIRECT_URI

  if (!CLIENT_ID || !REDIRECT_URI) {
    return new NextResponse(
      'Missing DISCORD_CLIENT_ID or DISCORD_REDIRECT_URI in environment variables',
      { status: 500 },
    )
  }

  const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI,
  )}&response_type=code&scope=identify`

  return NextResponse.redirect(DISCORD_OAUTH_URL)
}
