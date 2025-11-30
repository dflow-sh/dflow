import { Plus, Tag, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const TagsSection = ({
  form,
  fields,
  onAppend,
  onRemove,
}: {
  form: any
  fields: any[]
  onAppend: () => void
  onRemove: (index: number) => void
}) => {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium'>Tags</h3>
        <Button type='button' variant='outline' size='sm' onClick={onAppend}>
          <Plus className='mr-2 h-4 w-4' />
          Add Tag
        </Button>
      </div>

      {fields.length === 0 && (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <Tag className='mb-4 h-12 w-12 text-muted-foreground opacity-20' />
          <p className='text-muted-foreground'>No Tags Found</p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Add tags to help organize and identify your security groups
          </p>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className='rounded-md border p-4'>
          <div className='flex items-center justify-between'>
            <h4 className='font-medium'>Tag {index + 1}</h4>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => onRemove(index)}
              className='text-red-500 hover:text-red-600'>
              <Trash2 className='mr-1 h-4 w-4' />
              Remove
            </Button>
          </div>

          <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name={`tags.${index}.key`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Name' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`tags.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='MySecurityGroup' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default TagsSection
