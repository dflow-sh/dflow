import { getRolesAction } from "@core/actions/roles"
import { User } from "@core/payload-types"

import Invitation from "@core/components/Team/Invitation"
import Roles from "@core/components/Team/Roles"
import TeamMembers from "@core/components/Team/TeamMembers"

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
    <div className='space-y-10'>
      <Invitation roles={roles} tenant={tenant} />
      <TeamMembers roles={roles} teamMembers={teamMembers} />
      <Roles
        roles={roles}
        teamMembers={teamMembers}
        error={result?.serverError}
      />
    </div>
  )
}

export default TeamView
