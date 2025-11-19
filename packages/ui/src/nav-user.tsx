'use client'

import { Check, HelpCircle, LogOut } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

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
import { User } from '@/payload-types'

export function NavUser({ user }: { user: User }) {
  const params = useParams<{ organisation: string }>()
  const initial = user.email.slice(0, 1)

  const { execute } = useAction(logoutAction, {
    onSuccess: async ({ data }) => {
      toast.success('Logged out successfully')
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='relative'>
        <Avatar className='h-9 w-9 cursor-pointer rounded-lg'>
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl || ''}
              alt='User avatar'
              width={32}
              height={32}
              className='h-full w-full rounded-lg object-cover'
              loading='lazy'
              unoptimized
            />
          ) : (
            <AvatarFallback className='rounded-lg uppercase'>
              {initial}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Badge with letter at bottom right */}
        <span
          title={params.organisation}
          className='border-border bg-card/30 absolute -right-2 -bottom-2 flex h-5 w-5 items-center justify-center rounded-full border text-xs uppercase'>
          {params.organisation?.slice(0, 1)}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='w-64 rounded-lg'
        side='bottom'
        align='end'>
        <DropdownMenuLabel>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>Account</span>
            <span className='text-muted-foreground truncate text-xs'>
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className='text-muted-foreground font-normal'>
            Team
          </DropdownMenuLabel>
          {user?.tenants?.map(({ tenant }) =>
            typeof tenant === 'object' ? (
              <DropdownMenuItem className='group' key={tenant.id}>
                <Link
                  href={`/${tenant?.slug}/dashboard`}
                  className='flex h-full w-full items-center justify-between gap-2 text-sm'>
                  <div className='inline-flex items-center gap-x-2'>
                    <Avatar className='h-6 w-6 rounded-lg'>
                      <AvatarFallback className='rounded-lg uppercase'>
                        {tenant?.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>

                    <div className='inline-flex items-center gap-x-1'>
                      <p className='line-clamp-1 break-all'>{tenant?.name} </p>

                      <span className='text-muted-foreground group-hover:text-accent-foreground'>
                        {user.username === tenant?.slug && '(you)'}
                      </span>
                    </div>
                  </div>

                  {params.organisation === tenant?.slug && (
                    <Check size={20} className='text-primary' />
                  )}
                </Link>
              </DropdownMenuItem>
            ) : null,
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a
            href='https://discord.com/channels/1346775217594302484/1384588060393603099'
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center'>
            <HelpCircle />
            Help & Support
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            execute()
          }}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
