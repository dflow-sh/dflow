'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Node } from '@xyflow/react'
import { ChevronRight, Database, Github, Plus, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { JSX, memo, useState } from 'react'
import {
  UseFieldArrayRemove,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form'

import { Docker } from '@/components/icons'
import { ServiceNode } from '@/components/reactflow/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { slugifyWithUnderscore } from '@/lib/slugify'

import { VolumesType, volumesSchema } from './types'

type type = 'contextMenu' | 'sideBar'

const icon: { [key in ServiceNode['type']]: JSX.Element } = {
  app: <Github className='size-4' />,
  database: <Database className='size-4' />,
  docker: <Docker className='size-4' />,
}

const HostContainerPair = memo(
  ({
    id,
    removeVariable,
  }: {
    id: number
    removeVariable: UseFieldArrayRemove
    serviceName: string
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
                  {...field}
                  onChange={e => {
                    field.onChange(slugifyWithUnderscore(e.target.value))
                  }}
                  placeholder='default'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <span className='h-full text-center'>:</span>
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
                      field.onChange(slugifyWithUnderscore(e.target.value))
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
          onClick={async () => {
            removeVariable(+id)
            await trigger()
          }}>
          <Trash2 className='text-destructive' />
        </Button>
      </div>
    )
  },
)

HostContainerPair.displayName = 'HostContainerPair'

const AddVolumeToService = ({
  service,
  setNodes,
  onCloseContextMenu,
  type = 'sideBar',
  setOpenDialog,
}: {
  setNodes: Function
  service: ServiceNode
  onCloseContextMenu?: () => void
  type: type
  setOpenDialog?: (open: boolean) => void
}) => {
  const [open, setOpen] = useState(false)

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
    setNodes((prevNodes: Node[]) =>
      prevNodes.map(node => {
        if (node.id === service?.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...data,
            },
          }
        }
        return node
      }),
    )

    onCloseContextMenu?.()
    setOpenDialog?.(false)
    setOpen(false)
  }
  return (
    <div>
      <div onClick={() => setOpen(true)}>
        {type === 'contextMenu' ? (
          <div className='flex cursor-pointer items-center justify-between rounded px-2 py-1 text-muted-foreground hover:bg-primary/10 hover:text-primary'>
            Attach Volume
            <ChevronRight size={16} />
          </div>
        ) : (
          <div className='grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-4 overflow-y-hidden rounded-md py-3 pl-4 hover:bg-card/30'>
            <div className='flex items-center justify-between'>
              <div className='inline-flex items-center gap-x-2'>
                {icon[service.type]}
                <p>{service.name}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={isOpen => {
          if (!isOpen) {
            onCloseContextMenu?.()
            setOpenDialog?.(false)
          }
          setOpen(isOpen)
        }}>
        <DialogContent className='w-full md:w-[42rem]'>
          <DialogHeader>
            <DialogTitle>Manage Volumes</DialogTitle>
            <DialogDescription>
              Add or update volumes to store data persistently. Set mount paths
              to keep your data safe across restarts and updates.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className='space-y-2'>
                {fields.length ? (
                  <div className='grid grid-cols-[1fr_min-content_1fr_auto] gap-2 text-sm text-muted-foreground'>
                    <p className='font-semibold'>Host Path</p>
                    <span />
                    <p className='font-semibold'>Container Path</p>
                  </div>
                ) : null}
                {fields.map((field, index) => {
                  return (
                    <HostContainerPair
                      key={field.id}
                      id={index}
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
              <DialogFooter>
                <Button type='submit'>save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddVolumeToService

export const VolumeServicesList = ({
  nodes,
  setNodes,
  setOpen,
}: {
  nodes: Node[]
  setNodes: Function
  setOpen: (open: boolean) => void
}) => {
  return (
    <motion.div
      initial={{ x: '5%', opacity: 0.25 }}
      animate={{ x: 0, opacity: [0.25, 1] }}
      exit={{ x: '100%', opacity: 1 }}
      className='w-full'>
      {nodes.map(node => {
        const service = node.data as unknown as ServiceNode
        return (
          <AddVolumeToService
            setOpenDialog={setOpen}
            type='sideBar'
            key={node.id}
            setNodes={setNodes}
            service={service}
          />
        )
      })}
    </motion.div>
  )
}
