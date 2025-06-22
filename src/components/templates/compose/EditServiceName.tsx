import { zodResolver } from '@hookform/resolvers/zod'
import { Edge, Node } from '@xyflow/react'
import { SquarePen } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { ServiceNode } from '@/components/reactflow/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { slugify } from '@/lib/slugify'
import { cn } from '@/lib/utils'

import { EditServiceNameType, editServiceNameSchema } from './types'

type type = 'contextMenu' | 'sideBar'

const EditServiceName = ({
  service,
  edges,
  nodes,
  setNodes,
  type = 'sideBar',
  onCloseContextMenu,
}: {
  service: ServiceNode
  edges: Edge[]
  nodes: Node[]
  setNodes: Function
  type: type
  onCloseContextMenu?: () => void
}) => {
  const [ediServiceName, setEditServiceName] = useState<boolean>(false)
  const handleEditClick = useCallback(() => {
    setEditServiceName(true)
  }, [])

  const existingNames = useMemo(() => {
    return (
      nodes
        ?.filter(node => node.id !== service.id)
        .map(node => node.data?.name)
        .filter(Boolean) || []
    )
  }, [service.id, nodes])

  const form = useForm<EditServiceNameType>({
    resolver: zodResolver(editServiceNameSchema(existingNames as string[])),
    defaultValues: {
      name: service?.name,
      description: service?.description,
    },
  })

  useEffect(() => {
    if (ediServiceName) {
      form.reset({
        name: service?.name,
        description: service?.description,
      })
    }
  }, [ediServiceName, service, form])

  const updateServiceName = (data: EditServiceNameType) => {
    const oldServiceName = service.name

    const connectedEdges = edges.filter(edge => edge.target === service.id)
    const connectedNodeNames = connectedEdges.map(edge => edge.source)

    setNodes((prevNodes: Node[]) =>
      prevNodes.map(node => {
        // Update the current (renamed) node
        if (node.id === service.id) {
          const updatedVariables = Array.isArray(node.data?.variables)
            ? node.data.variables.map(
                (variable: NonNullable<ServiceNode['variables']>[number]) => {
                  const updatedValue = variable?.value.replace(
                    new RegExp(
                      `\\{\\{\\s*${oldServiceName}\\.(\\w+)\\s*\\}\\}`,
                      'g',
                    ),
                    `{{ ${data.name}.$1 }}`,
                  )
                  return { ...variable, value: updatedValue }
                },
              )
            : []

          return {
            ...node,
            data: {
              ...node.data,
              name: data.name,
              description: data.description,
              variables: updatedVariables,
            },
          }
        }

        // Update connected nodes
        if (connectedNodeNames.includes(node.id)) {
          const updatedVariables = Array.isArray(node.data?.variables)
            ? node.data.variables.map(
                (variable: NonNullable<ServiceNode['variables']>[number]) => {
                  const updatedValue = variable?.value.replace(
                    new RegExp(
                      `\\{\\{\\s*${oldServiceName}\\.(\\w+)\\s*\\}\\}`,
                      'g',
                    ),
                    `{{ ${data.name}.$1 }}`,
                  )
                  return { ...variable, value: updatedValue }
                },
              )
            : []

          return {
            ...node,
            data: {
              ...node.data,
              variables: updatedVariables,
            },
          }
        }

        return node
      }),
    )

    form.reset()
    setEditServiceName(false)
    onCloseContextMenu?.()
  }

  return (
    <div>
      <div onClick={handleEditClick} className='cursor-pointer'>
        {type === 'sideBar' ? (
          <div
            className={cn(
              'group inline-flex items-center gap-x-2 rounded px-2 py-1 hover:bg-muted-foreground/10',
            )}>
            <p className='flex-grow truncate'>{service.name}</p>
            <SquarePen
              className='hidden flex-shrink-0 group-hover:block'
              size={16}
            />
          </div>
        ) : (
          <div
            className={cn(
              'rounded px-2 py-1 text-muted-foreground hover:bg-primary/10 hover:text-primary',
            )}>
            Update Name
          </div>
        )}
      </div>

      {/* Edit Service Name Dialog */}
      <Dialog modal open={ediServiceName} onOpenChange={setEditServiceName}>
        <DialogContent onCloseAutoFocus={() => onCloseContextMenu?.()}>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(updateServiceName)}
              className='space-y-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={e => {
                          e.stopPropagation()
                          e.preventDefault()

                          e.target.value = slugify(e.target.value)

                          field.onChange(e)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ''}
                        onChange={e => {
                          e.stopPropagation()
                          e.preventDefault()

                          field.onChange(e)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type='submit'>Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EditServiceName
