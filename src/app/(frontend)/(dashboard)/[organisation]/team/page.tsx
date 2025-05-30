'use server'

import LayoutClient from '../../layout.client'

import { getTeamMembersAction } from '@/actions/team'
import TeamView from '@/components/Team'

const TeamPage = async () => {
  const result = await getTeamMembersAction()
  const teamMembers = result?.data?.length! > 0 ? result?.data : []

  return (
    <LayoutClient>
      <section>
        <h3 className='text-2xl font-semibold'>People</h3>
        <TeamView teamMembers={teamMembers} />
      </section>
    </LayoutClient>
  )
}

export default TeamPage
