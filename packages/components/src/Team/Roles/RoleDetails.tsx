import { Tag, TagInput } from 'emblor'
import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { CreateRoleType } from '@dflow/actions/roles/validator'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@dflow/components/ui/form'
import { Input } from '@dflow/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@dflow/components/ui/select'
import { Textarea } from '@dflow/components/ui/textarea'

const RoleDetails = ({ form }: { form: UseFormReturn<CreateRoleType> }) => {
  const { control, setValue, getValues } = form
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)

  const tagsFromForm = getValues('tags') || []

  const [tags, setTags] = useState<Tag[]>(
    tagsFromForm && Array.isArray(tagsFromForm)
      ? tagsFromForm.map(tag => ({ id: tag, text: tag }))
      : [{ id: 'Custom', text: 'Custom' }],
  )

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <FormField
          name='name'
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Role Name <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Admin' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name='type'
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Department <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select department' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='engineering'>Engineering</SelectItem>
                    <SelectItem value='management'>Management</SelectItem>
                    <SelectItem value='marketing'>Marketing</SelectItem>
                    <SelectItem value='finance'>Finance</SelectItem>
                    <SelectItem value='sales'>Sales</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name='tags'
        render={({ field }) => (
          <FormItem className='flex flex-col items-start'>
            <FormLabel className='text-left'>Tags</FormLabel>
            <FormControl>
              <TagInput
                className=''
                {...field}
                value={field.value ?? undefined}
                placeholder='Enter a tag'
                tags={tags}
                setTags={newTags => {
                  setTags(newTags)
                  if (Array.isArray(newTags)) {
                    setValue(
                      'tags',
                      newTags?.map(tag => tag.text),
                    )
                  }
                }}
                activeTagIndex={activeTagIndex}
                setActiveTagIndex={setActiveTagIndex}
                inlineTags={false}
                inputFieldPosition='top'
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name='description'
        control={control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Role Description <span className='text-destructive'>*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder='Complete access to applications'
                onChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}

export default RoleDetails
