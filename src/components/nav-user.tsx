'use client'

import { LogOut } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'

import { logoutAction } from '@/actions/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar'
import { User } from '@/payload-types'

export function NavUser({ user }: { user: User }) {
  const { execute } = useAction(logoutAction)
  const initial = user.email.slice(0, 1)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className='h-8 w-8 cursor-pointer rounded-lg'>
              {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
              <AvatarFallback className='rounded-lg uppercase'>
                {initial}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent className='rounded-lg' side='bottom' align='end'>
            <DropdownMenuLabel>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>Account</span>
                <span className='truncate text-xs text-muted-foreground'>
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                execute()
              }}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
