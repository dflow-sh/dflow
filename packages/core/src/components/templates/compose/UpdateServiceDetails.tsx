import { zodResolver } from '@hookform/resolvers/zod'
import { Edge, MarkerType, Node, useReactFlow } from '@xyflow/react'
import {
  Braces,
  Database,
  FileText,
  Globe,
  KeyRound,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { motion } from 'motion/react'
import {
  Fragment,
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

import {
  UpdateServiceSchema,
  UpdateServiceType,
} from '@/actions/templates/validator'
import Tabs from '@/components/Tabs'
import {
  Bitbucket,
  ClickHouse,
  Docker,
  Git,
  GitLab,
  Gitea,
  Github,
  MariaDB,
  MicrosoftAzure,
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
import { cn } from '@/lib/utils'
import { Service } from '@/payload-types'

import { PortForm } from "@core/components/templates/compose/AddDatabaseService"
import AddDockerService from "@core/components/templates/compose/AddDockerService"
import { VolumesForm } from "@core/components/templates/compose/AddVolumeToService"
import EditServiceName from "@core/components/templates/compose/EditServiceName"
import AddAzureDevopsService from "@core/components/templates/compose/git/AddAzureDevopsService"
import AddBitbucketService from "@core/components/templates/compose/git/AddBitbucketService"
import AddGiteaService from "@core/components/templates/compose/git/AddGiteaService"
import AddGithubService from "@core/components/templates/compose/git/AddGithubService"
import AddGitlabService from "@core/components/templates/compose/git/AddGitlabService"

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
  clickhouse: <ClickHouse className='size-6' />,
}

const icon: { [key in ServiceNode['type']]: JSX.Element } = {
  app: <Git className='size-6' />,
  database: <Database className='text-destructive size-6' />,
  docker: <Docker className='size-6' />,
}

const ProviderTypeIcons: {
  [key in NonNullable<Service['providerType']>]: JSX.Element
} = {
  github: <Github className='size-6' />,
  gitlab: <GitLab className='size-6' />,
  bitbucket: <Bitbucket className='size-6' />,
  azureDevOps: <MicrosoftAzure className='size-6' />,
  gitea: <Gitea className='size-6' />,
}

const UpdateServiceDetails = ({
  service,
  nodes,
  setServiceId,
  setNodes,
  edges,
  setEdges,
}: {
  service: ServiceNode
  nodes: Node[]
  setNodes: Function
  setServiceId: (id: string | null) => void
  edges: Edge[]
  setEdges: Function
}) => {
  const [tab, setTab] = useState(0)
  const { fitView } = useReactFlow()

  const tabs = useMemo(() => {
    return [
      {
        label: 'Settings',
        slug: 'settings',
        disabled: false,
      },
      {
        label: 'Environment',
        slug: 'environment',
        disabled: service?.type === 'database',
      },
      {
        label: 'Volumes',
        slug: 'volumes',
        disabled: service?.type === 'database',
      },
    ]
  }, [service?.id])

  const currentTab = tabs[tab]?.slug
  const TabsContent = useCallback(() => {
    switch (currentTab) {
      case 'settings':
        return (
          <Settings
            key={service?.id}
            service={service}
            setServiceId={setServiceId}
            nodes={nodes}
            setNodes={setNodes}
          />
        )
      case 'environment':
        return (
          <VariablesForm
            key={service?.id}
            service={service}
            nodes={nodes}
            setNodes={setNodes}
            setEdges={setEdges}
          />
        )
      case 'volumes':
        return (
          <motion.div
            initial={{ x: '5%', opacity: 0.25 }}
            animate={{ x: 0, opacity: [0.25, 1] }}
            exit={{ x: '100%', opacity: 1 }}
            className='w-full'>
            <VolumesForm
              service={service}
              setNodes={setNodes}
              className='h-full'
            />
          </motion.div>
        )
      default:
        return (
          <Settings
            key={service?.id}
            service={service}
            setServiceId={setServiceId}
            nodes={nodes}
            setNodes={setNodes}
          />
        )
    }
  }, [tab, service?.id])

  return (
    <div>
      {service && (
        <div
          className={cn(
            'border-border bg-background fixed top-[9.5rem] right-0 z-50 flex h-[calc(100vh-5rem)] w-full min-w-full flex-col rounded-t-md border-t border-l px-6 pb-40 shadow-lg transition-transform ease-in-out sm:max-w-sm md:right-0 md:min-w-[64%] md:rounded-tr-none lg:min-w-[55%]',
          )}>
          <div
            onClick={() => {
              sessionStorage.removeItem('nodeId')
              setServiceId(null)
              fitView({
                duration: 800,
              })
            }}
            className='focus:ring-none text-base-content absolute top-4 right-4 cursor-pointer rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden disabled:pointer-events-none'>
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </div>

          <div className='w-full space-y-4 pt-6 pb-2'>
            <div className='flex items-center gap-x-3'>
              {service?.type === 'database' && service?.databaseDetails?.type
                ? databaseIcons[service?.databaseDetails?.type]
                : service?.type === 'app' && service?.providerType
                  ? ProviderTypeIcons[service?.providerType]
                  : icon[service.type]}
              <EditServiceName
                type='sideBar'
                key={service?.id}
                edges={edges}
                service={service}
                nodes={nodes}
                setNodes={setNodes}
              />
            </div>
          </div>

          <div className='relative flex h-full flex-col overflow-hidden'>
            <Tabs
              tabs={tabs}
              activeTab={tab}
              defaultActiveTab={tab}
              onTabChange={index => {
                setTab(index)
              }}
            />
            <div className='scrollbar-custom w-full flex-1 overflow-x-auto overflow-y-auto'>
              <div className='w-full min-w-xl pt-4'>{TabsContent()}</div>
            </div>
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
  setNodes,
  setServiceId,
}: {
  service: ServiceNode
  nodes: Node[]
  setNodes: Function
  setServiceId: (id: string | null) => void
}) => {
  const deleteNode = (nodeId: string) => {
    setNodes((prevNodes: Node[]) =>
      prevNodes.filter(node => node.id !== nodeId),
    )
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('nodeId')
      setServiceId(null)
    }
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
      ) : service?.type === 'app' && service?.providerType === 'azureDevOps' ? (
        <>
          <h2 className='text-md pb-2 font-semibold'>Azure DevOps Details</h2>
          <AddAzureDevopsService
            setNodes={setNodes}
            nodes={nodes}
            type='update'
            service={service}
          />
        </>
      ) : service?.type === 'app' && service?.providerType === 'bitbucket' ? (
        <>
          <h2 className='text-md pb-2 font-semibold'>Bitbucket Details</h2>
          <AddBitbucketService
            nodes={nodes}
            setNodes={setNodes}
            type='update'
            service={service}
          />
        </>
      ) : service?.type === 'app' && service?.providerType === 'gitea' ? (
        <>
          <h2 className='text-md pb-2 font-semibold'>Gitea Details</h2>
          <AddGiteaService
            nodes={nodes}
            setNodes={setNodes}
            type='update'
            service={service}
          />
        </>
      ) : service?.type === 'app' && service?.providerType === 'gitlab' ? (
        <>
          <h2 className='text-md pb-2 font-semibold'>GitLab Details</h2>
          <AddGitlabService
            nodes={nodes}
            setNodes={setNodes}
            type='update'
            service={service}
          />
        </>
      ) : service?.type === 'database' ? (
        <>
          <h2 className='text-md font-semibold'>Database Details</h2>
          <PortForm key={service?.id} setNodes={setNodes} service={service} />
        </>
      ) : null}

      <div className='space-y-2 pt-4'>
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
          className='absolute top-1.5 right-2 h-6 w-6 rounded-sm'
          size='icon'
          variant='outline'>
          <Braces className='h-3! w-3!' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='max-h-64 overflow-y-scroll pt-0 pb-2'
        align='end'>
        <DropdownMenuLabel className='bg-popover sticky top-0 z-10 pt-2'>
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
  const [file, setFile] = useState<string | ArrayBuffer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
    insert: insertVariable,
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

  const parseEnv = (text: string | null) => {
    const parsedBulkVariables = text
      ?.split('\n')
      ?.map((line: string) => {
        const trimmedLine = line.trim()
        if (
          !trimmedLine ||
          trimmedLine.startsWith('#') ||
          trimmedLine.startsWith('//')
        ) {
          return null // Ignore empty lines or comments
        }

        const regex = /^([^=]+)=(.*)$/
        const match = trimmedLine.match(regex)

        if (match) {
          const [, key, value] = match
          return {
            key: key.trim(),
            value: value.trim().replace(/^"(.*)"$/, '$1'), // Trim quotes only if they wrap the entire value
          }
        } else {
          // Handle cases with only a key and no "=" sign
          return {
            key: trimmedLine,
            value: '',
          }
        }
      })
      ?.filter(Boolean)

    return parsedBulkVariables
  }

  const handlePaste = (
    event: React.ClipboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    event.preventDefault()
    const pastedText = event.clipboardData.getData('text/plain')
    const parsedBulkVariables = parseEnv(pastedText)
    if (parsedBulkVariables?.length) {
      removeVariable(index) // Remove the current field where the paste occurred
      const reversedVariables = [...parsedBulkVariables].reverse()
      reversedVariables.forEach((row: any) => {
        insertVariable(index, { key: row.key, value: row.value })
      })
    }
  }

  useEffect(() => {
    if (!file || typeof file !== 'string') return
    const parsedBulkVariables = parseEnv(file)
    if (!parsedBulkVariables?.length) return

    const lastIndex = fields.length - 1
    const lastItem = fields[lastIndex]

    if (lastItem && !lastItem.key && !lastItem.value) {
      removeVariable(lastIndex) // remove empty row
    }

    parsedBulkVariables.forEach(row => {
      if (row) appendVariable({ key: row.key, value: row.value })
    })
  }, [file, appendVariable])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      await handleFile(selectedFile)
    }
  }

  const isEnvFile = (filename: string) => {
    // Check if file starts with .env or matches pattern like env.local, etc.
    return filename.startsWith('.env') || filename.match(/^\.?env(\.|$)/i)
  }
  const handleFile = async (selectedFile: File) => {
    setIsLoading(true)

    if (!isEnvFile(selectedFile.name)) {
      toast.error(
        `Invalid file: ${selectedFile.name}. Only .env files are allowed.`,
      )
      setIsLoading(false)
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setFile(e.target.result)
        }
      }
      reader.readAsText(selectedFile)
    } catch (err: any) {
      toast.error(`Error reading file: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const selectFile = () => {
    fileInputRef.current?.click()
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
              <div className='text-muted-foreground grid grid-cols-[1fr_1fr_2.5rem] gap-4 text-sm'>
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
                          <Input
                            onPaste={e => handlePaste(e, index)}
                            {...field}
                          />
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

          <div className='flex w-full justify-between gap-3'>
            <div className='inline-flex items-center gap-x-2'>
              <Button
                type='button'
                variant={'outline'}
                onClick={e => {
                  e.stopPropagation(), selectFile()
                }}
                disabled={isLoading}>
                <FileText size={10} />
                Import .env
              </Button>
              <p className='text-muted-foreground'>
                or paste the .env contents above
              </p>
              <input
                ref={fileInputRef}
                type='file'
                className='hidden'
                accept='.env,.env.*'
                onChange={handleFileChange}
              />
            </div>
            <Button type='submit' variant='default'>
              Save
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}
