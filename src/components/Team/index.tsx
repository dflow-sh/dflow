import { User } from '@/payload-types'

import Invitation from './Invitation'
import TeamMembers from './TeamMembers'

function TeamView({ teamMembers }: { teamMembers: User[] | undefined }) {
  return (
    <div className='mt-4 space-y-10'>
      <Invitation />
      <TeamMembers teamMembers={teamMembers} />
    </div>
  )
}

export default TeamView
