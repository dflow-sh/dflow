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
import { toast } from 'sonner'

import { Docker } from '@dflow/components/icons'
import { ServiceNode } from '@dflow/components/reactflow/types'
import { Button } from '@dflow/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@dflow/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@dflow/components/ui/form'
import { Input } from '@dflow/components/ui/input'
import { ScrollArea } from '@dflow/components/ui/scroll-area'
import { slugifyWithUnderscore } from '@dflow/lib/slugify'
import { cn } from '@dflow/lib/utils'

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

export const VolumesForm = ({
  service,
  setNodes,
  onCloseContextMenu,
  setOpenDialog,
  setOpen,
  className,
}: {
  setNodes: Function
  service: ServiceNode
  onCloseContextMenu?: () => void
  setOpenDialog?: (open: boolean) => void
  setOpen?: (open: boolean) => void
  className?: string
}) => {
  const form = useForm<VolumesType>({
    resolver: zodResolver(volumesSchema),
    defaultValues: {
      volumes:
        Array.isArray(service?.volumes) && service.volumes.length
          ? service.volumes
          : [],
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

    toast.success(`Volumes updated successfully`)

    onCloseContextMenu?.()
    setOpenDialog?.(false)
    setOpen?.(false)
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='space-y-2'>
          {fields.length ? (
            <div className='text-muted-foreground grid grid-cols-[1fr_min-content_1fr_auto] gap-2 text-sm'>
              <p className='font-semibold'>Host Path</p>
              <span />
              <p className='font-semibold'>Container Path</p>
            </div>
          ) : null}
          <ScrollArea className={cn('h-72', className)}>
            <div className='space-y-2 p-1'>
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
                    hostPath: `/var/lib/dokku/data/storage/${service.name}/default`,
                    containerPath: '',
                  })
                }}>
                <Plus /> New Volume
              </Button>
            </div>
          </ScrollArea>
        </div>
        <DialogFooter className='flex items-end justify-end'>
          <Button type='submit'>Save</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

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

  return (
    <div>
      <div onClick={() => setOpen(true)}>
        {type === 'contextMenu' ? (
          <div className='text-muted-foreground hover:bg-primary/10 hover:text-primary flex cursor-pointer items-center justify-between rounded px-2 py-1'>
            Attach Volume
            <ChevronRight size={16} />
          </div>
        ) : (
          <div className='hover:bg-card/30 grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-4 overflow-y-hidden rounded-md py-3 pl-4'>
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
        <DialogContent className='max-w-3xl sm:w-full'>
          <DialogHeader>
            <DialogTitle>Manage Volumes</DialogTitle>
            <DialogDescription>
              Add or update volumes to store data persistently. Set mount paths
              to keep your data safe across restarts and updates.
            </DialogDescription>
          </DialogHeader>
          <VolumesForm
            service={service}
            setNodes={setNodes}
            onCloseContextMenu={onCloseContextMenu}
            setOpen={setOpen}
            setOpenDialog={setOpenDialog}
          />
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
