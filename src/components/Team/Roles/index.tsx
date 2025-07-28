'use client'

import { ShieldHalf } from 'lucide-react'

import { Role, User } from '@/payload-types'

import RolesList from './RolesList'

const Roles = ({
  roles,
  teamMembers,
}: {
  roles: Role[]
  teamMembers: User[] | undefined
}) => {
  return (
    <div className='rounded-2xl border bg-muted/10 p-6 shadow-lg'>
      <div className='flex items-center gap-x-2'>
        <ShieldHalf className='size-6' />
        <h1 className='text-2xl font-semibold'>Role Management</h1>
      </div>
      <p className='mt-2 text-muted-foreground'>
        Each role is displayed as an expandable section with detailed tabular
        information
      </p>
      <RolesList roles={roles} teamMembers={teamMembers} />
    </div>
  )
}

export default Roles
