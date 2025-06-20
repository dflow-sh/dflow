'use client'

import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Puzzle } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createTemplate } from '@/actions/templates'
import {
  CreateTemplateSchemaType,
  createTemplateSchema,
  servicesSchema,
} from '@/actions/templates/validator'
import { DockerRegistry, GitProvider, Service } from '@/payload-types'

export const servicesToTemplate = (
  services: Service[],
  projectName: string,
) => {
  const sortedServices = [...services].sort((a, b) => {
    if (a.type === 'database' && b.type !== 'database') return -1
    if (a.type !== 'database' && b.type === 'database') return 1
    return 0
  })

  const updatedServices = sortedServices.map(service => {
    const cleanServiceName = service.name.replace(`${projectName}-`, '')

    const updatedVariables = (service.variables || []).map(variable => {
      if (typeof variable.value !== 'string') return variable

      const updatedValue = variable.value.replace(
        /\{\{\s*(.*?)\s*\}\}/g,
        (match, inner) => {
          // Only replace inside the {{ ... }} block
          const cleanedInner = inner.replace(`${projectName}-`, '')
          return `{{ ${cleanedInner} }}`
        },
      )

      return {
        ...variable,
        value: updatedValue,
      }
    })

    return {
      name: cleanServiceName,
      variables: updatedVariables,
      type: service.type,
      ...(service.type === 'app' && {
        githubSettings: service.githubSettings,
        providerType: service.providerType,
        provider:
          typeof service.provider === 'object'
            ? (service.provider as GitProvider)?.id
            : typeof service.provider === 'string'
              ? service.provider
              : undefined,
        builder: service.builder || 'railpack',
      }),
      ...(service.type === 'database' && {
        databaseDetails: service.databaseDetails
          ? {
              type: service.databaseDetails.type || undefined,
              exposedPorts: service.databaseDetails.exposedPorts || undefined,
            }
          : undefined,
      }),
      ...(service.type === 'docker' && {
        dockerDetails: service.dockerDetails
          ? {
              url: service.dockerDetails.url,
              account:
                (service.dockerDetails.account as DockerRegistry)?.id ||
                undefined,
              ports: service.dockerDetails.ports,
            }
          : undefined,
      }),
    }
  })

  return updatedServices as z.infer<typeof servicesSchema>
}

const CreateTemplateFromProject = ({
  services,
  projectName,
}: {
  services: Service[]
  projectName: string
}) => {
  const updatedServices = servicesToTemplate(services, projectName)

  const [open, setOpen] = useState(false)
  const form = useForm<CreateTemplateSchemaType>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      services: updatedServices,
    },
  })

  const {
    execute: createTemplateAction,
    isPending: isCreateTemplateActionPending,
  } = useAction(createTemplate, {
    onSuccess: ({ data }) => {
      toast.success('Template created successfully')
      setOpen(false)
      form.reset()
    },
    onError: () => {
      toast.error('Failed to create template')
    },
  })

  const onSubmit = (data: CreateTemplateSchemaType) => {
    createTemplateAction({
      name: data.name,
      description: data.description,
      services: updatedServices,
    })
  }

  return (
    <>
      <Button variant='outline' onClick={() => setOpen(true)}>
        <Puzzle />
        Convert as Template
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Template from Project</DialogTitle>
            <DialogDescription>Deploy Template</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  isLoading={isCreateTemplateActionPending}
                  disabled={isCreateTemplateActionPending}
                  type='submit'>
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateTemplateFromProject
