import { zodResolver } from '@hookform/resolvers/zod'
import { Edge, MarkerType, Node } from '@xyflow/react'
import {
  Braces,
  Database,
  Github,
  Plus,
  SquarePen,
  Trash2,
  X,
} from 'lucide-react'
import { JSX, useEffect, useState } from 'react'
import { useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

import {
  UpdateServiceSchema,
  UpdateServiceType,
} from '@/actions/templates/validator'
import Tabs from '@/components/Tabs'
import {
  Docker,
  MariaDB,
  MongoDB,
  MySQL,
  PostgreSQL,
  Redis,
} from '@/components/icons'
import { ServiceNode } from '@/components/reactflow/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { slugify } from '@/lib/slugify'
import { cn } from '@/lib/utils'

type StatusType = NonNullable<
  NonNullable<ServiceNode['databaseDetails']>['type']
>

const databaseIcons: {
  [key in StatusType]: JSX.Element
} = {
  postgres: <PostgreSQL className='size-6' />,
  mariadb: <MariaDB className='size-6' />,
  mongo: <MongoDB className='size-6' />,
  mysql: <MySQL className='size-6' />,
  redis: <Redis className='size-6' />,
}

const icon: { [key in ServiceNode['type']]: JSX.Element } = {
  app: <Github className='size-6' />,
  database: <Database className='size-6 text-destructive' />,
  docker: <Docker className='size-6' />,
}

const UpdateServiceDetails = ({
  service,
  open,
  setOpen,
  nodes,
  setNodes,
  edges,
  setEdges,
}: {
  service: ServiceNode
  open: boolean
  setOpen: Function
  nodes: Node[]
  setNodes: Function
  edges: Edge[]
  setEdges: Function
}) => {
  const [ediServiceName, setEditServiceName] = useState<boolean>(false)
  const [serviceName, setServiceName] = useState<string>(service?.name ?? '')
  useEffect(() => {
    setServiceName(service?.name)
    console.log('edges', edges)
  }, [service])

  const updateServiceName = (newServiceName: string) => {
    const oldServiceName = service.name

    const connectedEdges = edges.filter(edge => edge.target === service.id)

    const connectedNodeNames = connectedEdges.map(edge => edge.source)
    console.log('connected nodes', connectedNodeNames, connectedEdges)

    setNodes((prevNodes: Node[]) =>
      prevNodes.map(node => {
        if (node.id === service.id) {
          return {
            ...node,
            data: {
              ...node.data,
              name: newServiceName,
            },
          }
        }

        if (connectedNodeNames.includes(node.id)) {
          const updatedVariables = Array.isArray(node.data?.variables)
            ? node.data.variables.map(
                (variable: NonNullable<ServiceNode['variables']>[number]) => {
                  const updatedValue = variable?.value.replace(
                    new RegExp(`\\$\\{\\{[^:{}\\s]+:${oldServiceName}\\.`),
                    match =>
                      match.replace(`${oldServiceName}.`, `${newServiceName}.`),
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
  }

  return (
    <div>
      {open && (
        <div
          className={cn(
            'fixed right-4 top-20 z-20 h-full w-3/4 min-w-[calc(100%-30px)] gap-4 rounded-md border-l border-t border-border bg-card px-6 pb-32 shadow-lg transition ease-in-out sm:max-w-sm md:-right-1 md:min-w-[64%] lg:min-w-[66%] xl:min-w-[66%]',
          )}>
          <div
            onClick={() => setOpen(false)}
            className='focus:ring-none text-base-content absolute right-4 top-4 cursor-pointer rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none'>
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </div>
          <div className='w-full space-y-4 pb-2 pt-6'>
            <div className='flex items-center gap-x-3'>
              {service.type === 'database' && service.databaseDetails?.type
                ? databaseIcons[service?.databaseDetails?.type]
                : icon[service.type]}
              <div
                onClick={() => setEditServiceName(true)}
                className='group inline-flex cursor-pointer items-center gap-x-2 rounded px-2 py-1 hover:bg-muted-foreground/10'>
                {service.name}
                <SquarePen className='hidden group-hover:block' size={16} />
              </div>
            </div>
            <Tabs
              tabs={[
                {
                  label: 'Settings',
                  content: () => <Settings service={service} />,
                },
                {
                  label: 'Environments',
                  content: () => (
                    <VariablesForm
                      service={service}
                      nodes={nodes}
                      setNodes={setNodes}
                      setEdges={setEdges}
                    />
                  ),
                  disabled: service.type === 'database',
                },
              ]}
            />
            <Dialog
              modal
              open={ediServiceName}
              onOpenChange={setEditServiceName}>
              <DialogContent
                onCloseAutoFocus={() => setServiceName(service?.name)}>
                <DialogHeader>
                  <DialogTitle>Update service name</DialogTitle>
                </DialogHeader>
                <Input
                  id='serviceName'
                  value={serviceName}
                  placeholder={service?.name || 'Enter service name'}
                  onChange={e => setServiceName(slugify(e.target.value))}
                  type='text'
                  required
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const trimmed = serviceName.trim()
                      if (trimmed === '') {
                        // Optionally show a message here
                        return
                      }

                      updateServiceName(trimmed)
                      setEditServiceName(false)
                    }
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  )
}

export default UpdateServiceDetails

const Settings = ({ service }: { service: ServiceNode }) => {
  console.log('service node', service)
  return service?.type === 'docker' ? (
    <p>Docker data</p>
  ) : service?.type === 'app' && service?.providerType === 'github' ? (
    <p>Github type</p>
  ) : null
}

const ReferenceVariableDropdown = ({
  databaseList: list = [],
  index,
}: {
  databaseList: ServiceNode[]
  index: number
}) => {
  const { setValue } = useFormContext()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          className='absolute right-2 top-1.5 h-6 w-6 rounded-sm'
          size='icon'
          variant='outline'>
          <Braces className='!h-3 !w-3' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='pb-2' align='end'>
        <DropdownMenuLabel>Link Database</DropdownMenuLabel>

        {list.length
          ? list.map(database => {
              return (
                <DropdownMenuItem
                  key={database.id}
                  onSelect={() => {
                    setValue(
                      `variables.${index}.value`,
                      '$' +
                        `{{${database.databaseDetails?.type}:${database.name + '.DATABASE_URI'}}}`,
                    )
                  }}>
                  {database.databaseDetails?.type &&
                    databaseIcons[database.databaseDetails?.type]}

                  {database.name}
                </DropdownMenuItem>
              )
            })
          : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const VariablesForm = ({
  service,
  setNodes,
  nodes,
  setEdges,
}: {
  service: ServiceNode
  setNodes: Function
  nodes: Node[]
  setEdges: Function
}) => {
  console.log(service.name)
  const form = useForm<UpdateServiceType>({
    resolver: zodResolver(UpdateServiceSchema),
    defaultValues: {
      name: service.name,
      variables:
        Array.isArray(service.variables) && service.variables.length
          ? service.variables
          : [
              {
                key: '',
                value: '',
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
    name: 'variables',
  })

  const databaseList = nodes
    .filter((node: Node) => (node.data as any)?.type === 'database')
    .map((node: Node) => node.data)

  const handleSubmit = (data: UpdateServiceType) => {
    const currentNodeName = service.name

    const referencedTargets = data?.variables
      ?.map(variable => {
        const match = variable.value.match(/\${{[^:{}\s]+:([\w-]+)\.[^{}\s]+}}/)
        return match?.[1] // Get referenced service name
      })
      .filter(Boolean)
      .filter(targetName => targetName !== currentNodeName)
      .map(targetName => {
        const targetNode = nodes.find(node => node.data?.name === targetName)
        return targetNode?.id
      })
      .filter(Boolean)

    // Use a Set to avoid duplicate targetIds
    const uniqueTargets = [...new Set(referencedTargets)]

    setEdges((prevEdges: Edge[]) => {
      const edgeMap = new Map<string, Edge>()

      // Retain only edges not from the current node
      prevEdges.forEach(edge => {
        const key = `${edge.source}->${edge.target}`
        if (edge.source !== service.id) {
          edgeMap.set(key, edge)
        }
      })

      // Add new edges from current node to targets, if not already present
      uniqueTargets.forEach(targetId => {
        const key = `${service.id}->${targetId}`
        if (!edgeMap.has(key)) {
          edgeMap.set(key, {
            id: `e-${service.id}-${targetId}`,
            source: service.id,
            target: targetId!,
            type: 'floating',
            style: { strokeDasharray: '5 5' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            label: 'Ref',
          })
        }
      })

      return Array.from(edgeMap.values())
    })

    // Update node variables
    setNodes((prevNodes: Node[]) =>
      prevNodes.map(node =>
        node.id === service.id
          ? {
              ...node,
              data: {
                ...node.data,
                variables: data.variables,
              },
            }
          : node,
      ),
    )

    toast.success('Variables updated successfully')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='w-full space-y-6'>
        <div className='space-y-2'>
          {fields.length ? (
            <div className='grid grid-cols-[1fr_1fr_2.5rem] gap-4 text-sm text-muted-foreground'>
              <p className='font-semibold'>Key</p>
              <p className='font-semibold'>Value</p>
            </div>
          ) : null}

          {fields.map((field, index) => {
            return (
              <div
                key={field?.id ?? index}
                className='grid grid-cols-[1fr_1fr_2.5rem] gap-4'>
                <FormField
                  control={form.control}
                  name={`variables.${index}.key`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`variables.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className='relative'>
                          <Input {...field} className='pr-8' />

                          <ReferenceVariableDropdown
                            index={index}
                            //@ts-ignore
                            databaseList={databaseList ?? []}
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
                    removeVariable(index)
                  }}>
                  <Trash2 className='text-destructive' />
                </Button>
              </div>
            )
          })}

          <Button
            type='button'
            variant='outline'
            onClick={() => {
              appendVariable({
                key: '',
                value: '',
              })
            }}>
            <Plus /> New Variable
          </Button>
        </div>

        <div className='flex w-full justify-end gap-3'>
          <Button type='submit' variant='outline'>
            Save
          </Button>
        </div>
      </form>
    </Form>
  )
}
