'use server'

import LayoutClient from '../layout.client'
import { Users } from 'lucide-react'

import { getTenantAction } from '@/actions/auth'
import { getTeamMembersAction } from '@/actions/team'
import AccessDeniedAlert from '@/components/AccessDeniedAlert'
import TeamView from '@/components/Team'

const TeamPage = async () => {
  const result = await getTeamMembersAction()
  const teamMembers = result?.data?.length! > 0 ? result?.data : []

  const tenant = await getTenantAction()

  return (
    <LayoutClient>
      <section>
        <div className='inline-flex items-center gap-2 text-2xl font-semibold'>
          <Users />
          <h3>Team</h3>
        </div>

        {result?.serverError ? (
          <AccessDeniedAlert className='mt-4' error={result?.serverError} />
        ) : (
          <TeamView teamMembers={teamMembers} tenant={tenant?.data} />
        )}
      </section>
    </LayoutClient>
  )
}

export default TeamPage
