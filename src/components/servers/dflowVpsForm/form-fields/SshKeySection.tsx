import { useDflowVpsForm } from '../DflowVpsFormProvider'
import { VpsFormData } from '../schemas'
import { Key, Plus } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import CreateSSHKey from '@/components/security/CreateSSHKey'
import { Button } from '@/components/ui/button'
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { MultiSelect } from '@/components/ui/multi-select'

export const SshKeySection = () => {
  const form = useFormContext<VpsFormData>()
  const { sshKeys } = useDflowVpsForm()

  return (
    <div className='mb-6'>
      <h2 className='mb-3 text-lg font-semibold text-foreground'>
        SSH Key Details <span className='text-destructive'>*</span>
      </h2>
      <div className='space-y-4 rounded-lg border border-border p-4'>
        <div className='mb-2 flex items-center space-x-2'>
          <Key className='h-5 w-5 text-primary' />
          <h3 className='font-semibold text-foreground'>SSH Authentication</h3>
        </div>

        <FormField
          control={form.control}
          name='login.sshKeyIds'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                SSH Keys <span className='text-destructive'>*</span>
              </FormLabel>
              <div className='flex items-center space-x-2'>
                <div className='flex-1'>
                  <MultiSelect
                    options={sshKeys.map(({ name, id }) => ({
                      label: name,
                      value: id,
                    }))}
                    onValueChange={field.onChange}
                    defaultValue={field.value || []}
                    placeholder={
                      sshKeys.length === 0
                        ? 'No SSH keys available'
                        : 'Select SSH keys'
                    }
                    className='w-full'
                  />
                </div>
                <CreateSSHKey
                  trigger={
                    <Button
                      onClick={(e: any) => e.stopPropagation()}
                      size='sm'
                      variant='outline'
                      type='button'
                      className='m-0 h-fit shrink-0 p-2'>
                      <Plus className='h-4 w-4' />
                    </Button>
                  }
                />
              </div>
              <FormMessage />
              <div className='mt-1 text-sm text-amber-500'>
                Selected keys will be used to access your server.
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
