'use server'

import LayoutClient from '../layout.client'

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
        <h3 className='text-2xl font-semibold'>People</h3>
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
