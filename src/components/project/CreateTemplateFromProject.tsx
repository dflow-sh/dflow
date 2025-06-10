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
import { GitProvider, Service } from '@/payload-types'

export const servicesToTemplate = (services: Service[]) => {
  const sortedServices = [...services].sort((a, b) => {
    if (a.type === 'database' && b.type !== 'database') return -1
    if (a.type !== 'database' && b.type === 'database') return 1
    return 0
  })

  const updatedServices = sortedServices.map(service => ({
    name: service.name,
    variables: service.variables || [],
    type: service.type,
    ...(service.type === 'app' && {
      githubSettings: service.githubSettings,
      providerType: service.providerType,
      provider: (service.provider as GitProvider)?.id || undefined,
      builder: service.builder || 'railpack',
    }),
    ...(service.type === 'database' && {
      databaseDetails: service.databaseDetails
        ? {
            ...service.databaseDetails,
            type: service.databaseDetails.type || undefined,
            exposedPorts: service.databaseDetails.exposedPorts || undefined,
          }
        : undefined,
    }),
    ...(service.type === 'docker' && {
      dockerDetails: service.dockerDetails,
    }),
  }))

  return updatedServices as z.infer<typeof servicesSchema>
}

const CreateTemplateFromProject = ({ services }: { services: Service[] }) => {
  const updatedServices = servicesToTemplate(services)

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
    },
    onError: () => {
      toast.error('Failed to create template')
    },
  })
  console.log('error', form.formState.errors)
  const onSubmit = (data: CreateTemplateSchemaType) => {
    console.log('data', data)
    createTemplateAction({
      name: data.name,
      description: data.description,
      services: updatedServices,
    })
  }
  return (
    <>
      <Button onClick={() => setOpen(true)}>Create Template</Button>
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
