'use client'

import { VolumesType, volumesSchema } from '../templates/compose/types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { memo } from 'react'
import {
  UseFieldArrayRemove,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form'
import { toast } from 'sonner'

import { updateVolumesAction } from '@/actions/service'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { slugify, slugifyWithSlash } from '@/lib/slugify'
import { Service } from '@/payload-types'

const VolumesForm = ({ service }: { service: Service }) => {
  const { execute: updateVolumes, isPending: isUpdateVolumePending } =
    useAction(updateVolumesAction, {
      onSuccess: () => {
        toast.success(`Volumes updated Successfully`)
      },
      onError: () => {
        toast.error(`Failed to update volumes`)
      },
    })
  const form = useForm<VolumesType>({
    resolver: zodResolver(volumesSchema),
    defaultValues: {
      volumes:
        Array.isArray(service?.volumes) && service.volumes.length
          ? service.volumes
          : [
              {
                containerPath: '',
                hostPath: '',
              },
            ],
    },
  })

  const {
    fields,
    append: appendVariable,
    remove: removeVariable,
  } = useFieldArray({
    control: form.control,
    name: 'volumes',
  })

  const onSubmit = (data: VolumesType) => {
    console.log('data', data)
    updateVolumes({
      id: service.id,
      volumes: data.volumes,
    })
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='space-y-2'>
          {fields.map((field, index) => {
            return (
              <KeyValuePair
                key={field.id}
                id={index}
                removeVariable={removeVariable}
                serviceName={service?.name!}
              />
            )
          })}

          <Button
            type='button'
            variant='outline'
            onClick={() => {
              appendVariable({
                hostPath: '',
                containerPath: '',
              })
            }}>
            <Plus /> New Volume
          </Button>
        </div>
        <Button type='submit'>save</Button>
      </form>
    </Form>
  )
}

export default VolumesForm

const KeyValuePair = memo(
  ({
    id,
    removeVariable,
  }: {
    id: number
    removeVariable: UseFieldArrayRemove
    serviceName: string
  }) => {
    const { control } = useFormContext()

    return (
      <div className='flex w-full items-center gap-x-2 font-mono'>
        <FormField
          control={control}
          name={`volumes.${id}.hostPath`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  onChange={e => {
                    field.onChange(slugify(e.target.value))
                  }}
                  placeholder='default'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <span>:</span>
        <FormField
          control={control}
          name={`volumes.${id}.containerPath`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className='relative'>
                  <Input
                    {...field}
                    onChange={e => {
                      field.onChange(slugifyWithSlash(e.target.value))
                    }}
                    placeholder='/data'
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          variant='ghost'
          type='button'
          size='icon'
          onClick={() => {
            removeVariable(+id)
          }}>
          <Trash2 className='text-destructive' />
        </Button>
      </div>
    )
  },
)
