import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import { Loader } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center relative justify-center gap-2 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'

    // When using asChild, we need to ensure we only have one child
    if (asChild) {
      // For asChild, wrap everything in a single element
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}>
          <span className='relative inline-flex w-full items-center justify-center'>
            <span className={isLoading ? 'invisible' : 'visible'}>
              {children}
            </span>
            {isLoading && (
              <div className='absolute inset-0 flex items-center justify-center text-foreground'>
                <Loader className='animate-spin [&_svg]:size-5' />
              </div>
            )}
          </span>
        </Comp>
      )
    }

    // For regular buttons, we can have multiple children
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        aria-busy={isLoading}
        {...props}>
        <span
          className={`${isLoading ? 'invisible' : 'visible'} inline-flex w-full items-center justify-center gap-1`}>
          {children}
        </span>

        {isLoading && (
          <div className='absolute inset-0 flex items-center justify-center text-foreground [&_svg]:size-5'>
            <Loader className='animate-spin' />
          </div>
        )}
      </Comp>
    )
  },
)

Button.displayName = 'Button'

export { Button, buttonVariants }
