'use client'

import { ShieldHalf } from 'lucide-react'

import { Role, User } from "@core/payload-types"

import RolesList from "@core/components/Team/Roles/RolesList"

const Roles = ({
  roles,
  teamMembers,
  error,
}: {
  roles: Role[]
  teamMembers: User[] | undefined
  error: string | undefined
}) => {
  return (
    <div className='bg-muted/10 rounded-2xl border p-6 shadow-lg'>
      <div className='flex items-center gap-x-2'>
        <ShieldHalf className='size-6' />
        <h1 className='text-2xl font-semibold'>Role Management</h1>
      </div>
      <p className='text-muted-foreground mt-2'>
        Each role is displayed as an expandable section with detailed tabular
        information
      </p>
      <RolesList roles={roles} error={error} teamMembers={teamMembers} />
    </div>
  )
}

export default Roles
