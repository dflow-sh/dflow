'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Edge,
  MarkerType,
  Node,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import { useAction } from 'next-safe-action/hooks'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator'

import {
  createTemplate,
  getTemplateById,
  updateTemplate,
} from '@/actions/templates'
import {
  CreateTemplateSchemaType,
  createTemplateSchema,
} from '@/actions/templates/validator'
import { ServiceNode } from '@/components/reactflow/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Template } from '@/payload-types'

import ChooseService, { ChildRef, getPositionForNewNode } from './ChooseService'

const convertNodesToServices = (nodes: any[]) => {
  console.log('nodes to be filter', nodes)
  return nodes
    .filter(node => node && node.data)
    .map(({ data }) => {
      const { onClick, ...cleanedData } = data
      return cleanedData
    })
}

function convertToGraph(services: Template['services']) {
  if (!services || services.length === 0) return { nodes: [], edges: [] }

  const nodes: ServiceNode[] = services.map(item => {
    const node: ServiceNode = {
      id: item.id!,
      name: item.name,
      type: item.type,
      variables: item.variables ?? undefined,
    }

    switch (item.type) {
      case 'database':
        node.databaseDetails = item.databaseDetails ?? undefined
        break

      case 'app':
        node.githubSettings = item.githubSettings ?? undefined
        node.builder = item.builder ?? undefined
        node.provider =
          typeof item.provider === 'string' ? item.provider : undefined
        node.providerType = item.providerType ?? undefined
        break

      case 'docker':
        node.dockerDetails = item.dockerDetails ?? undefined
        break
    }

    return node
  })

  // Map service name to ID for quick lookup
  const nameToIdMap = new Map(services.map(s => [s.name, s.id]))
  const edgeSet = new Set<string>()
  const edges: Edge[] = []

  const serviceNameRegex = /\${{[^:{}\s]+:([\w-]+)\.[^{}\s]+}}/

  services.forEach(service => {
    const sourceId = service.id!
    const sourceName = service.name
    const envVars = service.variables ?? []

    envVars.forEach((env: any) => {
      if (typeof env.value === 'string') {
        const match = env.value.match(serviceNameRegex)
        if (match) {
          const targetName = match[1]
          const targetId = nameToIdMap.get(targetName)

          if (targetId && targetId !== sourceId) {
            const edgeId = `e-${sourceId}-${targetId}`

            if (!edgeSet.has(edgeId)) {
              edges.push({
                id: edgeId,
                source: sourceId,
                target: targetId,
              })
              edgeSet.add(edgeId)
            }
          }
        }
      }
    })
  })

  return { nodes, edges }
}

const CreateNewTemplate = () => {
  const [openCreateTemplate, setOpenCreateTemplate] = useState<boolean>(false)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const childRef = useRef<ChildRef>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('templateId')

  const {
    register,
    reset,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<CreateTemplateSchemaType>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '-',
        style: 'lowerCase',
        length: 2,
      }),
      services: convertNodesToServices(nodes),
    },
  })

  //create template api
  const { execute: createNewTemplate, isPending: isCreateNewTemplatePending } =
    useAction(createTemplate, {
      onSuccess: ({ data, input }) => {
        if (data) {
          toast.success(`Template created successfully`)
          router.push('/templates')
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to create template`)
      },
    })

  const {
    execute: updateExistingTemplate,
    isPending: isUpdateTemplatePending,
  } = useAction(updateTemplate, {
    onSuccess: ({ data, input }) => {
      if (data) {
        toast.success(`Template updated successfully`)
        router.push('/templates')
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to update template`)
    },
  })

  //getTemplateBYId api
  const {
    execute: getTemplateByIdAction,
    isPending: isGetTemplateByIdPending,
    result: template,
  } = useAction(getTemplateById, {
    onError: ({ error }) => {
      toast.error(`Failed to get template: ${error.serverError}`)
    },
  })

  const onSubmit = (data: CreateTemplateSchemaType) => {
    if (templateId && template?.data) {
      updateExistingTemplate({
        id: templateId,
        name: data.name,
        description: data.description,
        services: convertNodesToServices(nodes),
      })
    } else {
      createNewTemplate({
        name: data?.name,
        description: data?.description,
        services: convertNodesToServices(nodes),
      })
    }
  }

  const callChildFunction = (args: { serviceId: string }) => {
    childRef.current?.handleOnClick(args)
  }

  useEffect(() => {
    if (templateId) {
      getTemplateByIdAction({ id: templateId })
    }
  }, [templateId])

  useEffect(() => {
    if (!template?.data?.services) return

    setValue('name', template?.data?.name)
    setValue('description', template?.data?.description ?? '')

    const { edges: edgesData, nodes: nodesData } = convertToGraph(
      template.data.services,
    )

    const initialNodes = nodesData?.map((node, index) => ({
      id: node.id,
      position: getPositionForNewNode(index),
      data: {
        ...node,
        onClick: () => callChildFunction({ serviceId: node.id! }),
      },
      type: 'custom',
    }))

    const initialEdges = edgesData.map(edge => ({
      ...edge,
      type: 'floating',
      style: { strokeDasharray: '5 5' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      label: 'Ref',
    }))

    setNodes(initialNodes || [])
    setEdges(initialEdges)
  }, [template?.data?.services])

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-end p-2'>
        <Button
          className='z-20'
          variant={'default'}
          disabled={nodes?.length <= 0}
          onClick={() => setOpenCreateTemplate(true)}>
          {templateId && template?.data ? 'Update template' : 'Save template'}
        </Button>
      </div>
      <ChooseService
        ref={childRef}
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      />
      {/* Template creation */}
      <Dialog open={openCreateTemplate} onOpenChange={setOpenCreateTemplate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='space-y-4'>
              <div>
                <Label>
                  Name <span className='text-red-500'>*</span>
                </Label>
                <Input {...register('name')} />
                {errors.name?.message && <p>{errors.name?.message}</p>}
              </div>
              <div>
                <Label>Description</Label>
                <Textarea {...register('description')} className='min-h-44' />
              </div>
            </div>
            <DialogFooter className='mt-4'>
              <Button
                disabled={isCreateNewTemplatePending || isUpdateTemplatePending}
                type='submit'>
                {templateId && template?.data ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateNewTemplate
