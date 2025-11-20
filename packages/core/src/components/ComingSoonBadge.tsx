'use client'

import { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'

type Position =
  | 'top-left'
  | 'top-right'
  | 'top-middle'
  | 'right-middle'
  | 'bottom-right'
  | 'bottom-middle'
  | 'bottom-left'
  | 'left-middle'

interface WithBadgeProps {
  text?: string
  icon?: ReactNode
  position?: Position
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  size?: 'compact' | 'default'
  hideBadge?: boolean
}

// Position class mapping for badge placement
const positionClasses: Record<Position, string> = {
  'top-left': '-left-3 -top-2',
  'top-right': '-right-3 -top-2',
  'top-middle': 'left-1/2 -top-2 -translate-x-1/2',
  'right-middle': '-right-3 top-1/2 -translate-y-1/2',
  'bottom-right': '-right-3 -bottom-2',
  'bottom-middle': 'left-1/2 -bottom-2 -translate-x-1/2',
  'bottom-left': '-left-3 -bottom-2',
  'left-middle': '-left-3 top-1/2 -translate-y-1/2',
}

// Size classes for the badge
const sizeClasses = {
  compact: 'px-1 py-0 text-[0.6rem]',
  default: 'px-2 py-0.5 text-xs',
}

// HOC to add a "Coming Soon" badge to any component, only when not hidden
export function withComingSoonBadge<P extends object>(
  Component: React.ComponentType<P>,
  {
    text = 'Coming Soon',
    icon,
    position = 'top-right',
    variant = 'default',
    size = 'compact',
    hideBadge = false,
  }: WithBadgeProps = {},
) {
  return function WithComingSoonBadge(props: P & { hideBadge?: boolean }) {
    // Determine if component should show badge - check both props and config
    const shouldHideBadge =
      props.hideBadge !== undefined ? props.hideBadge : hideBadge

    // If badge should be hidden, don't show it
    if (shouldHideBadge) {
      return <Component {...props} />
    }

    return (
      <div className='relative inline-flex'>
        <Component {...props} />
        <Badge
          variant={variant}
          className={`absolute z-10 w-max ${positionClasses[position]} ${sizeClasses[size]}`}>
          {icon && <span className='mr-1'>{icon}</span>}
          {text}
        </Badge>
      </div>
    )
  }
}

// Alternative implementation as a regular component for simpler use cases
interface BadgeWrapperProps {
  children: ReactNode
  text?: string
  icon?: ReactNode
  position?: Position
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  size?: 'compact' | 'default'
  hideBadge?: boolean
}

export function ComingSoonBadge({
  children,
  text = 'Coming Soon',
  icon,
  position = 'top-right',
  variant = 'default',
  size = 'compact',
  hideBadge = false,
}: BadgeWrapperProps) {
  // If badge should be hidden, return children without badge
  if (hideBadge) {
    return <>{children}</>
  }

  return (
    <div className='relative inline-flex'>
      {children}
      <Badge
        variant={variant}
        className={`absolute z-10 w-max ${positionClasses[position]} ${sizeClasses[size]}`}>
        {icon && <span className='mr-1'>{icon}</span>}
        {text}
      </Badge>
    </div>
  )
}
