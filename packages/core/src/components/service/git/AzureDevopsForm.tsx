'use client'

import SidebarToggleButton from "@core/components/SidebarToggleButton"
import SecretContent from "@core/components/ui/blur-reveal"
import { zodResolver } from '@hookform/resolvers/zod'
import { Workflow } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateServiceAction } from "@core/actions/service"
import { updateServiceSchema } from "@core/actions/service/validator"
import { Alert, AlertDescription, AlertTitle } from "@core/components/ui/alert"
import { Button } from "@core/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@core/components/ui/form"
import { Input } from "@core/components/ui/input"
import { Label } from "@core/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@core/components/ui/radio-group"
import { buildOptions } from "@core/lib/buildOptions"
import { Service } from "@core/payload-types"

const AzureDevopsForm = ({ service }: { service: Service }) => {
  const params = useParams<{ serviceId: string }>()

  const form = useForm<z.infer<typeof updateServiceSchema>>({
    resolver: zodResolver(updateServiceSchema),
    defaultValues: {
      id: params.serviceId,
      providerType: 'azureDevOps',
      builder: service?.builder ?? 'buildPacks',
      azureSettings: {
        repository: service?.azureSettings?.repository || '',
        branch: service?.azureSettings?.branch || '',
        owner: service?.azureSettings?.owner || '',
        gitToken: service?.azureSettings?.gitToken || '',
        port: service?.azureSettings?.port || 3000,
        buildPath: service?.azureSettings?.buildPath || '/',
      },
    },
  })

  const { execute: saveServiceDetails, isPending } = useAction(
    updateServiceAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          toast.success(
            'Successfully updated, trigger deployment to apply changes!',
          )
        }
      },
      onError: ({ error }) => {
        toast.error(
          error?.serverError ||
            'Failed to update service details, please try again.',
        )
      },
    },
  )

  function onSubmit(values: z.infer<typeof updateServiceSchema>) {
    saveServiceDetails(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-6'>
        <Alert variant='info'>
          <Workflow className='h-4 w-4' />

          <AlertTitle>Automatic deployments are coming soon!</AlertTitle>
          <AlertDescription>
            For now, you can set up your Azure DevOps service with the following
            details. Make sure to trigger a deployment after saving the changes.
          </AlertDescription>
        </Alert>

        <div className='grid gap-4 md:grid-cols-2'>
          {/* Repository URL */}
          <FormField
            control={form.control}
            name='azureSettings.repository'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repository URL</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder='ex: https://github.com/akhil-naidu/dflow'
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Branch */}
          <FormField
            control={form.control}
            name='azureSettings.branch'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder='ex: main or commit-hash: 6492769'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Repository URL */}
          <FormField
            control={form.control}
            name='azureSettings.owner'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder='ex: your-username'
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Branch */}
          <FormField
            control={form.control}
            name='azureSettings.gitToken'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Git Token</FormLabel>
                <FormControl>
                  <SecretContent defaultHide={!!field.value}>
                    <Input type='text' {...field} />
                  </SecretContent>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Port */}
          <FormField
            control={form.control}
            name='azureSettings.port'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Port
                  <SidebarToggleButton
                    directory='services'
                    fileName='app-service'
                    sectionId='#port--editable'
                  />
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='ex: 3000'
                    {...field}
                    value={field.value || ''}
                    onChange={e => {
                      const value = e.target.value
                        ? parseInt(e.target.value, 10)
                        : ''
                      field.onChange(value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Build path */}
          <FormField
            control={form.control}
            name='azureSettings.buildPath'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Build path{' '}
                  <SidebarToggleButton
                    directory='services'
                    fileName='app-service'
                    sectionId='#build-path--editable'
                  />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='builder'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Builder
                <SidebarToggleButton
                  directory='services'
                  fileName='app-service'
                  sectionId='#builder--editable'
                />
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className='grid w-full gap-4 md:grid-cols-2'>
                  {buildOptions.map(({ value, label, icon, description }) => (
                    <FormItem
                      className='flex w-full items-center space-y-0 space-x-3'
                      key={value}>
                      <FormControl>
                        <div className='has-data-[state=checked]:border-ring border-input relative flex h-full w-full items-start gap-2 rounded-md border p-4 shadow-2xs outline-hidden'>
                          <RadioGroupItem
                            value={value}
                            id={value}
                            aria-describedby={`${label}-builder`}
                            className='order-1 after:absolute after:inset-0'
                          />
                          <div className='flex grow items-start gap-3'>
                            {icon}

                            <div className='grid grow gap-2'>
                              <Label htmlFor={value}>{label}</Label>

                              <p className='text-muted-foreground text-xs'>
                                {description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex w-full justify-end'>
          <Button
            type='submit'
            disabled={isPending}
            isLoading={isPending}
            variant='outline'>
            Save
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default AzureDevopsForm
