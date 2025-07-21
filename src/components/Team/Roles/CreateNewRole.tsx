import { zodResolver } from '@hookform/resolvers/zod'
import { Tag, TagInput } from 'emblor'
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

import { createRoleAction } from '@/actions/roles'
import { createRoleSchema, createRoleType } from '@/actions/roles/validator'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/check-box'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

const CreateNewRole = ({
  setOpenItem,
}: {
  setOpenItem: (value: string | undefined) => void
}) => {
  const [createStep, setCreateStep] = useState(1)
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)

  const [tags, setTags] = useState<Tag[]>([
    {
      id: '1',
      text: 'Custom',
    },
  ])

  const form = useForm<createRoleType>({
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

  const { control, setValue } = form

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

  const onSubmit = (data: createRoleType) => {
    createRole({
      ...data,
    })
  }

  return (
    <AccordionItem
      value='new-role'
      className='rounded-md border border-border px-4'>
      <AccordionTrigger className='flex w-full cursor-pointer items-center justify-between hover:no-underline'>
        <div className='flex items-center gap-x-2'>
          <CirclePlus className='size-8 text-primary' />
          <div>
            <h3 className='text-lg font-semibold'> Create New Role </h3>
            <p className='line-clamp-1 break-all text-sm text-muted-foreground'>
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
                    <div className='space-y-4'>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <FormField
                          name='name'
                          control={control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Role Name{' '}
                                <span className='text-destructive'>*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder='Admin' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          name='type'
                          control={control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Department{' '}
                                <span className='text-destructive'>*</span>
                              </FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue='engineering'>
                                  <SelectTrigger>
                                    <SelectValue placeholder='Select department' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='engineering'>
                                      Engineering
                                    </SelectItem>
                                    <SelectItem value='management'>
                                      Management
                                    </SelectItem>
                                    <SelectItem value='marketing'>
                                      Marketing
                                    </SelectItem>
                                    <SelectItem value='finance'>
                                      Finance
                                    </SelectItem>
                                    <SelectItem value='sales'>Sales</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name='tags'
                        render={({ field }) => (
                          <FormItem className='flex flex-col items-start'>
                            <FormLabel className='text-left'>Tags</FormLabel>
                            <FormControl>
                              <TagInput
                                {...field}
                                value={field.value ?? undefined}
                                placeholder='Enter a tag'
                                tags={tags}
                                setTags={newTags => {
                                  setTags(newTags)
                                  if (Array.isArray(newTags)) {
                                    setValue(
                                      'tags',
                                      newTags?.map(tag => tag.text),
                                    )
                                  }
                                }}
                                activeTagIndex={activeTagIndex}
                                setActiveTagIndex={setActiveTagIndex}
                                inlineTags={false}
                                inputFieldPosition='top'
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name='description'
                        control={control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Role Description{' '}
                              <span className='text-destructive'>*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder='Complete access to applications'
                                onChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
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
                    <div className='overflow-hidden rounded-lg border border-border'>
                      <Table className='w-full'>
                        <TableHeader>
                          <TableRow>
                            <TableHead className='w-[300px]'>
                              Collection
                            </TableHead>
                            <TableHead>Create</TableHead>
                            <TableHead>Read</TableHead>
                            <TableHead>Update</TableHead>
                            <TableHead>Delete</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className='text-md font-semibold'>
                              Projects
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='projects.create'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='projects.read'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='projects.update'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='projects.delete'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className='text-md font-semibold'>
                              Servers
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='servers.create'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='servers.read'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='servers.update'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='servers.delete'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className='text-md font-semibold'>
                              Services
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='services.create'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='services.read'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='services.update'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='services.delete'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className='text-md font-semibold'>
                              Templates
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='templates.create'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='templates.read'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='templates.update'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='templates.delete'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className='text-md font-semibold'>
                              Roles
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='roles.create'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='roles.read'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='roles.update'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='roles.delete'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className='text-md font-semibold'>
                              Backups
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='backups.create'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='backups.read'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='backups.update'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='backups.delete'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className='text-md font-semibold'>
                              Security Groups
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='securityGroups.create'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='securityGroups.read'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='securityGroups.update'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='securityGroups.delete'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className='text-md font-semibold'>
                              SSH Keys
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='sshKeys.create'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='sshKeys.read'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='sshKeys.update'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='sshKeys.delete'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className='text-md font-semibold'>
                              Cloud Provider Accounts
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='cloudProviderAccounts.create'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='cloudProviderAccounts.read'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='cloudProviderAccounts.update'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='cloudProviderAccounts.delete'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className='text-md font-semibold'>
                              Docker Registries
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='dockerRegistries.create'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='dockerRegistries.read'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='dockerRegistries.update'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='dockerRegistries.delete'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className='text-md font-semibold'>
                              Git Providers
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='gitProviders.create'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='gitProviders.read'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='gitProviders.update'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='gitProviders.delete'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className='text-md font-semibold'>
                              Team
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='team.create'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='team.read'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='team.update'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name='team.delete'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
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
                      disabled={!name || !description || !type}
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
