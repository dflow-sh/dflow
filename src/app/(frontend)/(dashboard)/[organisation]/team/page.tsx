'use server'

import LayoutClient from '../layout.client'

import { getTenantAction } from '@/actions/auth'
import { getTeamMembersAction } from '@/actions/team'
import TeamView from '@/components/Team'

const TeamPage = async () => {
  const result = await getTeamMembersAction()
  const teamMembers = result?.data?.length! > 0 ? result?.data : []

  const tenant = await getTenantAction()

  return (
    <LayoutClient>
      <section>
        <h3 className='text-2xl font-semibold'>People</h3>
        <TeamView teamMembers={teamMembers} tenant={tenant?.data} />
      </section>
    </LayoutClient>
  )
}

export default TeamPage
