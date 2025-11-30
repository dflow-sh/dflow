import { redirect } from 'next/navigation'

import InvitationView from '@/components/invite'
import { getCurrentUser } from '@/lib/getCurrentUser'
import { verifyInviteToken } from '@/lib/verifyInviteToken'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

interface InvitationData {
  tenantId: string
  role: string
}

type Invitation = InvitationData | 'expired' | null

const InvitePage = async ({ searchParams }: PageProps) => {
  const token = (await searchParams)?.token

  if (!token) {
    redirect('/')
  }

  const result = await verifyInviteToken(token)
  const user = await getCurrentUser()

  return (
    <InvitationView
      token={token}
      user={user}
      invitationData={result as Invitation}
    />
  )
}

export default InvitePage
