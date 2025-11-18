import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle,
  ChevronDown,
  CirclePlus,
  Lock,
  Plus,
  Settings,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { createRoleAction } from '@dflow/actions/roles'
import { CreateRoleType, createRoleSchema } from '@dflow/actions/roles/validator'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@dflow/components/ui/accordion'
import { Badge } from '@dflow/components/ui/badge'
import { Button } from '@dflow/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@dflow/components/ui/card'
import { Form } from '@dflow/components/ui/form'

import PermissionsTable from './PermissionsTable'
import RoleDetails from './RoleDetails'

const CreateNewRole = ({
  setOpenItem,
}: {
  setOpenItem: (value: string | undefined) => void
}) => {
  const [createStep, setCreateStep] = useState(1)

  const form = useForm<CreateRoleType>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'engineering',
      tags: ['Custom'],
      projects: {
        create: true,
        read: true,
        delete: false,
        update: false,
      },
      services: {
        create: true,
        read: true,
        delete: false,
        update: true,
      },
      servers: {
        create: false,
        read: true,
        delete: false,
        update: false,
      },
      roles: {
        create: false,
        read: true,
        delete: false,
        update: false,
      },
      templates: {
        create: false,
        read: true,
        delete: false,
        update: false,
      },
      backups: {
        create: false,
        read: true,
        delete: false,
        update: false,
      },
      cloudProviderAccounts: {
        create: false,
        read: true,
        delete: false,
        update: false,
      },
      dockerRegistries: {
        create: false,
        read: true,
        delete: false,
        update: false,
      },
      gitProviders: {
        create: false,
        read: true,
        delete: false,
        update: false,
      },
      sshKeys: {
        create: false,
        read: true,
        delete: false,
        update: false,
      },
      securityGroups: {
        create: false,
        read: true,
        delete: false,
        update: false,
      },
      team: {
        create: false,
        read: true,
        delete: false,
        update: false,
      },
    },
  })

  const { control } = form

  const { name, description, type } = useWatch({ control: control })

  const { execute: createRole, isPending: isRoleCreatePending } = useAction(
    createRoleAction,
    {
      onSuccess: () => {
        toast.success('Role created Successfully')
        form.reset()
        setCreateStep(1)
        setOpenItem('')
      },
      onError: ({ error }) => {
        toast.error(`Failed to create role ${error.serverError}`)
      },
    },
  )

  const onSubmit = (data: CreateRoleType) => {
    createRole({
      ...data,
    })
  }

  return (
    <AccordionItem
      value='new-role'
      className='border-border rounded-md border px-4'>
      <AccordionTrigger className='flex w-full cursor-pointer items-center justify-between hover:no-underline'>
        <div className='flex items-center gap-x-2'>
          <CirclePlus className='text-primary size-8' />
          <div>
            <h3 className='text-lg font-semibold'> Create New Role </h3>
            <p className='text-muted-foreground line-clamp-1 text-sm break-all'>
              Add new role with custom permissions and settings
            </p>
          </div>
        </div>

        <div className='flex flex-1 items-center justify-end gap-x-4 pr-2'>
          <Badge className='justify-end' variant={'info'}>
            Step {createStep} of 2
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className='px-6 pb-6'>
        <div className='space-y-6'>
          {/* Progress Indicator */}
          <div className='mb-8 flex items-center'>
            {[1, 2].map(step => (
              <div key={step} className='flex items-center'>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step <= createStep
                      ? 'bg-primary transition-colors duration-300'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                  {step < createStep ? (
                    <CheckCircle className='h-4 w-4' />
                  ) : (
                    step
                  )}
                </div>
                {step < 2 && (
                  <div
                    className={`mx-2 h-1 w-[220px] ${step < createStep ? 'bg-primary' : 'bg-muted'}`}
                  />
                )}
              </div>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {createStep === 1 && (
                <Card className='p-6'>
                  <CardHeader className='px-0 pt-0'>
                    <CardTitle className='flex items-center gap-2'>
                      <Settings className='h-5 w-5' />
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Define the basic properties of your new role
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='px-0'>
                    <RoleDetails form={form} />
                  </CardContent>
                </Card>
              )}

              {createStep === 2 && (
                <Card className='p-6'>
                  <CardHeader className='px-0 pt-0'>
                    <CardTitle className='flex items-center gap-2'>
                      <Lock className='h-5 w-5' />
                      Permission Selection
                    </CardTitle>
                    <CardDescription>
                      Choose the permissions for this role.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='px-0'>
                    <div className='border-border overflow-hidden rounded-lg border'>
                      <PermissionsTable form={form} />
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className='flex items-center justify-between pt-6'>
                <div className='flex items-center gap-2'>
                  {createStep > 1 && (
                    <Button
                      variant='outline'
                      type='button'
                      onClick={() => setCreateStep(createStep - 1)}>
                      <ChevronDown className='h-4 w-4 rotate-90' />
                      Previous
                    </Button>
                  )}
                </div>

                <div className='flex items-center gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setOpenItem('')
                      setCreateStep(1)
                      form.reset()
                    }}>
                    Cancel
                  </Button>

                  {createStep < 2 && (
                    <Button
                      type='button'
                      onClick={() => {
                        setCreateStep(createStep + 1)
                      }}
                      disabled={!name?.trim() || !description?.trim() || !type}
                      className='gap-2'>
                      Next Step
                      <ChevronDown className='h-4 w-4 -rotate-90' />
                    </Button>
                  )}

                  {createStep === 2 && (
                    <Button
                      type='submit'
                      disabled={isRoleCreatePending}
                      isLoading={isRoleCreatePending}>
                      <Plus className='h-4 w-4' />
                      Create Role
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default CreateNewRole
