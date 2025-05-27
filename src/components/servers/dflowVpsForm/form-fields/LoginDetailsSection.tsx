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
          render={() => (
            <FormItem>
              <FormLabel>
                Username <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  id='defaultUser'
                  className='w-full bg-background'
                  type='text'
                  value='root'
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
          render={() => (
            <FormItem>
              <FormLabel>
                Password <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  id='rootPassword'
                  className='w-full bg-background'
                  type='text'
                  value='141086'
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
