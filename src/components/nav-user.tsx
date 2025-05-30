'use client'

import { Check, LogOut } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { logoutAction } from '@/actions/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar'
import { Tenant, User } from '@/payload-types'
import { useNetworkStatusContext } from '@/providers/NetworkStatusProvider'

export function NavUser({ user }: { user: User }) {
  const { execute } = useAction(logoutAction)
  const params = useParams()

  const initial = user.email.slice(0, 1)
  const { isOnline } = useNetworkStatusContext()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className='relative'>
              <Avatar className='h-8 w-8 cursor-pointer rounded-lg'>
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl || ''}
                    alt='User avatar'
                    className='h-8 w-8 rounded-lg object-cover'
                    loading='lazy'
                  />
                ) : (
                  <AvatarFallback className='rounded-lg uppercase'>
                    {initial}
                  </AvatarFallback>
                )}
              </Avatar>

              <div
                role='status'
                title={isOnline ? 'online' : 'offline'}
                className={`size-2.5 rounded-full ${isOnline ? 'bg-success' : 'bg-destructive'} absolute -bottom-0.5 -right-0.5 border border-background`}
              />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className='w-64 rounded-lg'
            side='bottom'
            align='end'>
            <DropdownMenuLabel>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>Account</span>
                <span className='truncate text-xs text-muted-foreground'>
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className='font-normal text-muted-foreground'>
                Team
              </DropdownMenuLabel>
              {user?.tenants?.map(tenant => (
                <DropdownMenuItem className='group' key={tenant.id}>
                  <Link
                    href={`/${(tenant?.tenant as Tenant)?.slug}/dashboard`}
                    className='flex h-full w-full items-center justify-between gap-2 text-sm'>
                    <div className='inline-flex items-center gap-x-2'>
                      <Avatar className='h-6 w-6 rounded-lg'>
                        <AvatarFallback className='rounded-lg uppercase group-hover:text-accent'>
                          {(tenant?.tenant as Tenant)?.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='inline-flex items-center gap-x-1'>
                        <p className='line-clamp-1 break-all'>
                          {(tenant?.tenant as Tenant)?.name}{' '}
                        </p>
                        <span className='text-muted-foreground group-hover:text-accent-foreground'>
                          {user.username === (tenant?.tenant as Tenant)?.slug &&
                            '(you)'}
                        </span>
                      </div>
                    </div>
                    {params.organisation ===
                      (tenant?.tenant as Tenant)?.slug && (
                      <Check size={20} className='text-primary' />
                    )}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
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
