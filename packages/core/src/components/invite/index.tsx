'use client'

import Logo from '../Logo'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { joinTeamAction } from '@/actions/team'
import { Tenant, User } from '@/payload-types'
import { useBrandingContext } from '@/providers/BrandingProvider'

interface InvitationData {
  tenantId: string
  role: string
}

type Invitation = InvitationData | 'expired' | null

function InvitationView({
  invitationData,
  user,
  token,
}: {
  invitationData: Invitation
  user: User | null
  token: string
}) {
  const router = useRouter()
  const { branding } = useBrandingContext()
  if (invitationData === null) {
    toast.error('Invalid invitation link')
  }

  const { execute: joinTeam, isPending: isJoinTeamPending } = useAction(
    joinTeamAction,
    {
      onSuccess: data => {
        toast.success('Successfully joined in team')
        const joinedTenant =
          invitationData && invitationData !== 'expired'
            ? data.data?.tenants?.find(
                tenant =>
                  (tenant.tenant as Tenant).id === invitationData?.tenantId,
              )?.tenant
            : null
        router.push(
          joinedTenant
            ? `/${(joinedTenant as Tenant)?.slug}/dashboard`
            : `/${user?.username}/dashboard`,
        )
      },
      onError: error => {
        toast.error(
          `Failed to join team, ${error?.error?.serverError && error?.error.serverError}`,
        )
      },
    },
  )

  return (
    <div className='flex h-screen w-full items-center justify-center'>
      <Card className='w-96'>
        <CardHeader>
          <CardTitle>You have been invited to join the team</CardTitle>
          <CardDescription>
            Joining the team gives you access to all projects and the ability to
            create and collaborate on new ones
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className='w-full max-w-md'>
            <Logo
              className='mx-auto mb-2 max-h-28'
              skeletonClassName='mx-auto mb-2'
            />

            <h6 className='mb-6 text-center text-lg font-semibold'>
              Welcome to {branding?.title || 'Dflow'}
            </h6>
          </div>
        </CardContent>

        <CardFooter>
          {user ? (
            <Button
              disabled={
                invitationData === null ||
                invitationData === 'expired' ||
                isJoinTeamPending
              }
              isLoading={isJoinTeamPending}
              onClick={() => {
                if (invitationData && invitationData !== 'expired') {
                  joinTeam({
                    role: invitationData.role,
                    tenantId: invitationData.tenantId,
                  })
                }
              }}
              className='w-full'>
              Join team
            </Button>
          ) : (
            <div>
              <p className='mb-4 text-sm text-muted-foreground'>
                To join the team, please sign in if you already have an account,
                or sign up to create one.
              </p>
              <div className='inline-flex w-full items-center gap-x-2'>
                <Button className='w-full'>
                  <Link className='w-full' href={`/sign-in?token=${token}`}>
                    Sign In
                  </Link>
                </Button>
                <Button className='w-full'>
                  <Link className='w-full' href={`/sign-up?token=${token}`}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default InvitationView
