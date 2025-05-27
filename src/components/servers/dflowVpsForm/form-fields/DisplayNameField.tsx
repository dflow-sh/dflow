import { useFormContext } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export const DisplayNameField = () => {
  const form = useFormContext()

  return (
    <div className='mb-6'>
      <FormField
        control={form.control}
        name='displayName'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Display Name <span className='text-destructive'>*</span>
            </FormLabel>
            <FormControl>
              <Input {...field} className='w-full bg-background' type='text' />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
