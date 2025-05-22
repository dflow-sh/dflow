import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { getTenant } from '@/lib/get-tenant'

export async function POST(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await getTenant()

  if (!user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      discord: {},
    },
  })

  return NextResponse.json({ success: true })
}
