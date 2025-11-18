'use server'

import LayoutClient from '../layout.client'
import { Users } from 'lucide-react'
import { Suspense } from 'react'

import { getTenantAction } from '@dflow/actions/auth'
import { getTeamMembersAction } from '@dflow/actions/team'
import AccessDeniedAlert from '@dflow/components/AccessDeniedAlert'
import TeamView from '@dflow/components/Team'
import TeamSkeleton from '@dflow/components/skeletons/TeamSkeleton'

const TeamPage = async () => {
  const result = await getTeamMembersAction()
  const teamMembers = result?.data?.length! > 0 ? result?.data : []

  const tenant = await getTenantAction()

  return (
    <LayoutClient>
      <Suspense fallback={<TeamSkeleton />}>
        <section>
          <div className='inline-flex items-center gap-2 pb-4 text-2xl font-semibold'>
            <Users />
            <h3>Team</h3>
          </div>

          {result?.serverError ? (
            <AccessDeniedAlert className='mt-4' error={result?.serverError} />
          ) : (
            <TeamView teamMembers={teamMembers} tenant={tenant?.data} />
          )}
        </section>
      </Suspense>
    </LayoutClient>
  )
}

export default TeamPage
