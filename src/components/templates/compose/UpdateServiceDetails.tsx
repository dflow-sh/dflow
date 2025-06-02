import { zodResolver } from '@hookform/resolvers/zod'
import { Edge, MarkerType, Node } from '@xyflow/react'
import {
  Braces,
  Database,
  Github,
  Globe,
  KeyRound,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { motion } from 'motion/react'
import { Fragment, JSX, useEffect, useState } from 'react'
import { useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

import {
  UpdateServiceSchema,
  UpdateServiceType,
} from '@/actions/templates/validator'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import { PortForm } from './AddDatabaseService'
import AddDockerService from './AddDockerService'
import AddGithubService from './AddGithubService'
import EditServiceName from './EditServiceName'

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
  const [activeTab, setActiveTab] = useState('settings')
  useEffect(() => {
    if (service?.type === 'database' && activeTab === 'environment') {
      setActiveTab('settings')
    }
  }, [service?.id])
  return (
    <div>
      {open && (
        <div
          className={cn(
            'fixed right-4 top-[9.5rem] z-50 flex h-[calc(100vh-5rem)] w-3/4 min-w-[calc(100%-30px)] flex-col overflow-hidden rounded-md border-l border-t border-border bg-[#171d33] px-6 pb-20 shadow-lg transition ease-in-out sm:max-w-sm md:right-0 md:min-w-[64%] lg:min-w-[55%]',
          )}>
          <div
            onClick={() => {
              setOpen(false)
              setActiveTab('settings')
            }}
            className='focus:ring-none text-base-content absolute right-4 top-4 cursor-pointer rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none'>
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </div>

          <div className='w-full space-y-4 pb-2 pt-6'>
            <div className='flex items-center gap-x-3'>
              {service.type === 'database' && service.databaseDetails?.type
                ? databaseIcons[service?.databaseDetails?.type]
                : icon[service.type]}
              <EditServiceName
                key={service?.id}
                edges={edges}
                service={service}
                nodes={nodes}
                setNodes={setNodes}
              />
            </div>
          </div>

          {/* Tabs section */}
          <div className='relative flex h-full flex-col overflow-hidden'>
            <Tabs
              onValueChange={setActiveTab}
              value={activeTab}
              defaultValue='settings'
              className='flex h-full flex-col'>
              <div className='sticky top-0 z-10 bg-[#171e33] pt-2'>
                <TabsList className='rounded bg-primary/10'>
                  <TabsTrigger value='settings'>Settings</TabsTrigger>
                  <TabsTrigger
                    disabled={service?.type == 'database'}
                    value='environment'>
                    Environment
                  </TabsTrigger>
                </TabsList>
                <div className='border-base-content/40 w-full border-b pt-2' />
              </div>

              <div className='flex-1 overflow-y-auto overflow-x-hidden px-1 pb-8 pt-4'>
                <TabsContent className='w-full' value='settings'>
                  <Settings
                    key={service?.id}
                    service={service}
                    nodes={nodes}
                    setNodes={setNodes}
                    setOpen={setOpen}
                  />
                </TabsContent>
                <TabsContent className='w-full' value='environment'>
                  <VariablesForm
                    key={service?.id}
                    service={service}
                    nodes={nodes}
                    setNodes={setNodes}
                    setEdges={setEdges}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  )
}

export default UpdateServiceDetails

const Settings = ({
  service,
  nodes,
  setOpen,
  setNodes,
}: {
  service: ServiceNode
  nodes: Node[]
  setNodes: Function
  setOpen: Function
}) => {
  const deleteNode = (nodeId: string) => {
    setNodes((prevNodes: Node[]) =>
      prevNodes.filter(node => node.id !== nodeId),
    )
    setOpen(false)
  }
  return (
    <div>
      {service?.type === 'docker' ? (
        <>
          <h2 className='text-md pb-2 font-semibold'>Docker Details</h2>
          <AddDockerService
            type='update'
            nodes={nodes}
            setNodes={setNodes}
            service={service}
          />
        </>
      ) : service?.type === 'app' && service?.providerType === 'github' ? (
        <>
          <h2 className='text-md pb-2 font-semibold'>Github Details</h2>
          <AddGithubService
            type='update'
            nodes={nodes}
            setNodes={setNodes}
            service={service}
          />
        </>
      ) : service?.type === 'database' ? (
        <>
          <h2 className='text-md font-semibold'>Database Details</h2>
          <PortForm key={service?.id} setNodes={setNodes} service={service} />
        </>
      ) : null}

      <div className='space-y-2'>
        <h2 className='text-md font-semibold'>Remove Service</h2>
        <motion.div
          initial={{ x: '5%', opacity: 0.25 }}
          animate={{ x: 0, opacity: [0.25, 1] }}
          exit={{ x: '100%', opacity: 1 }}
          className='w-full space-y-2'>
          <p className='text-muted-foreground'>
            Once this service is removed, it will be permanently deleted from
            the template and cannot be recovered.
          </p>
          <Button
            onClick={() => deleteNode(service.id)}
            variant={'destructive'}>
            Remove service
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

const variables = [
  {
    type: 'private',
    value: 'URI',
  },
  {
    type: 'private',
    value: 'NAME',
  },
  {
    type: 'private',
    value: 'USERNAME',
  },
  {
    type: 'private',
    value: 'PASSWORD',
  },
  {
    type: 'private',
    value: 'HOST',
  },
  {
    type: 'private',
    value: 'PORT',
  },
  {
    type: 'public',
    value: 'PUBLIC_HOST',
  },
  {
    type: 'public',
    value: 'PUBLIC_PORT',
  },
  {
    type: 'public',
    value: 'PUBLIC_URI',
  },
] as const

const ReferenceVariableDropdown = ({
  databaseList: list = [],
  serviceName = '',
  index,
}: {
  serviceName: string
  databaseList: ServiceNode[]
  index: number
}) => {
  const { setValue, getValues } = useFormContext()
  const publicDomain = `{{ ${serviceName}.DFLOW_PUBLIC_DOMAIN }}`
  const secretKey = `{{ secret(64, "abcdefghijklMNOPQRSTUVWXYZ") }}`

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

      <DropdownMenuContent
        className='max-h-64 overflow-y-scroll pb-2 pt-0'
        align='end'>
        <DropdownMenuLabel className='sticky top-0 z-10 bg-popover pt-2'>
          Reference Variables
        </DropdownMenuLabel>

        <DropdownMenuItem
          onSelect={() => {
            setValue(`variables.${index}.value`, publicDomain)
          }}>
          <Globe className='size-6 text-green-600' />
          {publicDomain}
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => {
            setValue(`variables.${index}.value`, secretKey)
          }}>
          <KeyRound className='size-6 text-blue-500' />
          {secretKey}
        </DropdownMenuItem>

        {list.length
          ? list.map(database => {
              const environmentVariableValue = `${database.name}.${database.databaseDetails?.type?.toUpperCase()}`

              return (
                <Fragment key={database.id}>
                  {variables.map(({ value }) => {
                    const previousValue = getValues(`variables.${index}.value`)
                    const populatedValue = `{{ ${environmentVariableValue}_${value} }}`

                    return (
                      <DropdownMenuItem
                        key={value}
                        onSelect={() => {
                          setValue(
                            `variables.${index}.value`,
                            `${previousValue}${populatedValue}`,
                          )
                        }}>
                        {database.databaseDetails?.type &&
                          databaseIcons[database.databaseDetails?.type]}

                        {populatedValue}
                      </DropdownMenuItem>
                    )
                  })}
                </Fragment>
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
        const match = variable.value.match(
          /\{\{\s*([a-zA-Z0-9-_]+)\.([A-Z0-9_]+)\s*\}\}/,
        )
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
    <motion.div
      initial={{ x: '5%', opacity: 0.25 }}
      animate={{ x: 0, opacity: [0.25, 1] }}
      exit={{ x: '100%', opacity: 1 }}
      className='w-full'>
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
                              serviceName={service.name}
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
    </motion.div>
  )
}
