import { useFormContext } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export const LoginDetailsSection = () => {
  const form = useFormContext()

  return (
    <div className='mb-6'>
      <h2 className='mb-3 text-lg font-semibold text-foreground'>
        Server Login Details <span className='text-destructive'>*</span>
      </h2>
      <div className='space-y-4 rounded-lg border border-border p-4'>
        <FormField
          control={form.control}
          name='login.username'
          render={field => (
            <FormItem>
              <FormLabel>
                Username <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className='w-full bg-background'
                  value={'root'}
                  type='text'
                  disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='login.rootPassword'
          render={field => (
            <FormItem>
              <FormLabel>
                Password <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={141086}
                  className='w-full bg-background'
                  type='number'
                  disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
