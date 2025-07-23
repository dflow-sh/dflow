import { getRolesAction } from '@/actions/roles'
import { User } from '@/payload-types'

import Invitation from './Invitation'
import Roles from './Roles'
import TeamMembers from './TeamMembers'

async function TeamView({
  teamMembers,
  tenant,
}: {
  teamMembers: User[] | undefined
  tenant: any
}) {
  const result = await getRolesAction()
  const roles = result?.data ?? []

  return (
    <div className='mt-4 space-y-10'>
      <Invitation roles={roles} tenant={tenant} />
      <TeamMembers roles={roles} teamMembers={teamMembers} />
      <Roles roles={roles} teamMembers={teamMembers} />
    </div>
  )
}

export default TeamView
