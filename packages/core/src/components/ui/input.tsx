import { Eye, EyeOff } from 'lucide-react'
import * as React from 'react'

import { cn } from "@core/lib/utils"

interface InputProps extends React.ComponentProps<'input'> {
  showPasswordToggle?: boolean
}

function Input({ className, type, showPasswordToggle, ...props }: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [inputType, setInputType] = React.useState(type)

  // Create a clear variable to determine when to show the toggle
  const shouldShowToggle =
    showPasswordToggle === true ||
    (type === 'password' && showPasswordToggle !== false)

  React.useEffect(() => {
    if (shouldShowToggle) {
      // For password fields, toggle between 'password' and 'text'
      // For other fields, toggle between original type and 'password'
      if (type === 'password') {
        setInputType(showPassword ? 'text' : 'password')
      } else {
        setInputType(showPassword ? 'password' : type)
      }
    } else {
      setInputType(type)
    }
  }, [showPassword, type, shouldShowToggle])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  if (shouldShowToggle) {
    return (
      <div className='relative'>
        <input
          type={inputType}
          data-slot='input'
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pr-10 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            className,
          )}
          {...props}
        />
        <button
          type='button'
          onClick={togglePasswordVisibility}
          className='text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-10 items-center justify-center transition-colors'
          aria-label={showPassword ? 'Hide password' : 'Show password'}>
          {showPassword ? (
            <Eye className='h-4 w-4' />
          ) : (
            <EyeOff className='h-4 w-4' />
          )}
        </button>
      </div>
    )
  }

  return (
    <input
      type={inputType}
      data-slot='input'
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
