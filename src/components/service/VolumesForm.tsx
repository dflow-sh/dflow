'use client'

import { VolumesType, volumesSchema } from '../templates/compose/types'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { memo, useEffect } from 'react'
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
import { slugifyWithSlash, slugifyWithUnderscore } from '@/lib/slugify'
import { Service } from '@/payload-types'

const HostContainerPair = memo(
  ({
    id,
    removeVariable,
    created,
  }: {
    id: number
    removeVariable: UseFieldArrayRemove
    serviceName: string
    created: boolean | null | undefined
  }) => {
    const { control, trigger } = useFormContext()

    return (
      <div className='grid w-full grid-cols-[1fr_min-content_1fr_auto] gap-2 font-mono'>
        <FormField
          control={control}
          name={`volumes.${id}.hostPath`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  disabled={Boolean(created)}
                  {...field}
                  onChange={e => {
                    field.onChange(slugifyWithUnderscore(e.target.value))
                  }}
                  placeholder='eg: default'
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
            <FormItem className='relative'>
              <FormControl>
                <div className='relative'>
                  <Input
                    disabled={Boolean(created)}
                    {...field}
                    onChange={e => {
                      field.onChange(slugifyWithSlash(e.target.value))
                    }}
                    placeholder='eg: /data'
                  />
                </div>
              </FormControl>
              <div className='absolute -right-1 -top-5'>
                {created ? (
                  <Badge>Mounted</Badge>
                ) : (
                  <Badge variant={'destructive'}>Not mounted</Badge>
                )}
              </div>
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
            trigger()
          }}>
          <Trash2 className='text-destructive' />
        </Button>
      </div>
    )
  },
)

HostContainerPair.displayName = 'HostContainerPair'

const VolumesForm = ({ service }: { service: Service }) => {
  const { execute: updateVolumes, isPending: isUpdateVolumePending } =
    useAction(updateVolumesAction, {
      onSuccess: () => {
        toast.success(`Volumes saved successfully`)

        setTimeout(() => {
          toast.info('Volumes started mounting,please wait')
        }, 1500)
      },
      onError: () => {
        toast.error(`Failed to save volumes`)
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
    updateVolumes({
      id: service.id,
      volumes: data.volumes,
    })
  }

  useEffect(() => {
    if (Array.isArray(service?.volumes)) {
      form.reset({
        volumes: service.volumes.length
          ? service.volumes
          : [{ containerPath: '', hostPath: '' }],
      })
    }
  }, [service?.volumes])
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='space-y-4'>
          {fields.length ? (
            <div className='grid grid-cols-[1fr_min-content_1fr_auto] gap-2 text-left text-sm text-muted-foreground'>
              <p className='font-semibold'>Host Path</p>
              <p />
              <p className='font-semibold'>Container Path</p>
            </div>
          ) : null}
          {fields.map((field, index) => {
            return (
              <HostContainerPair
                key={field.id}
                id={index}
                created={field?.created}
                removeVariable={removeVariable}
                serviceName={service.name}
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
        <div className='flex items-center justify-end'>
          <Button
            type='submit'
            disabled={isUpdateVolumePending}
            isLoading={isUpdateVolumePending}>
            save
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default VolumesForm
