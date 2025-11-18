import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@dflow/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'dark:border-destructive/50 dark:bg-destructive/10 dark:text-destructive/80 bg-red-100 text-red-900 border-red-900 dark:[&>svg]:text-destructive/80 [&>svg]:text-red-900',
        info: 'border-info/50 dark:bg-info-foreground/50 text-info bg-blue-100 dark:border-info [&>svg]:text-info',
        warning:
          'dark:border-warning/50 border-amber-900 text-amber-900 dark:bg-warning-foreground/50 bg-amber-100 dark:text-warning dark:[&>svg]:text-warning [&>svg]:text-amber-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot='alert'
      role='alert'
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-title'
      className={cn('mb-1 leading-none font-medium tracking-tight', className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-description'
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
}

export { Alert, AlertDescription, AlertTitle }
