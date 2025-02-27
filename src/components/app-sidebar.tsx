'use client'

import {
  GitBranch,
  HardDrive,
  KeyRound,
  LayoutDashboard,
  Workflow,
} from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { User } from '@/payload-types'

interface SidebarInterface extends React.ComponentProps<typeof Sidebar> {
  user: User
}

const settings = [
  // {
  //   name: 'Profile',
  //   href: '/settings/profile',
  //   icon: UserRound,
  // },
  // {
  //   name: 'Appearance',
  //   href: '/settings/appearance',
  //   icon: Palette,
  // },

  {
    name: 'Servers',
    href: '/settings/servers',
    icon: HardDrive,
  },
  {
    name: 'SSH Keys',
    href: '/settings/ssh-keys',
    icon: KeyRound,
  },
  {
    name: 'Git',
    href: '/settings/git',
    icon: GitBranch,
  },
  // {
  //   name: 'Team',
  //   href: '/settings/team',
  //   icon: UsersRound,
  // },
]

export function AppSidebar({ user, ...props }: SidebarInterface) {
  const { state } = useSidebar()

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <div className='mt-2 flex items-center gap-2 text-2xl font-semibold'>
          <Workflow className='text-primary' />
          {state === 'expanded' && <p>Dflow</p>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarSeparator />

        <SidebarMenu>
          <SidebarMenuItem className='mx-2'>
            <SidebarMenuButton asChild>
              <Link href='/dashboard'>
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>

            <SidebarMenu>
              {settings.map(item => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
