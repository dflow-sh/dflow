'use client'

import { Button } from '../ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { getServersAction } from '@/actions/server'
import { deleteTemplate, deployTemplateAction } from '@/actions/templates'
import { deployTemplateSchema } from '@/actions/templates/validator'
import { Card, CardContent } from '@/components/ui/card'
import { DialogFooter } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Template } from '@/payload-types'

const TemplateDeploymentForm = ({ templateId }: { templateId: string }) => {
  const { execute: deployTemplate, isPending: deployingTemplate } =
    useAction(deployTemplateAction)

  const {
    execute: getServers,
    isPending: gettingServers,
    result,
  } = useAction(getServersAction)

  useEffect(() => {
    getServers()
  }, [])

  const form = useForm<z.infer<typeof deployTemplateSchema>>({
    resolver: zodResolver(deployTemplateSchema),
    defaultValues: {
      id: templateId,
    },
  })

  function onSubmit(values: z.infer<typeof deployTemplateSchema>) {
    deployTemplate(values)
  }

  const servers = result?.data ?? []

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='serverId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Server</FormLabel>
              <Select
                disabled={gettingServers}
                onValueChange={field.onChange}
                defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        gettingServers
                          ? 'Fetching servers...'
                          : 'Select a server'
                      }
                    />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {servers.map(({ id, name }) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type='submit' disabled={deployingTemplate}>
            Deploy
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

const TemplateDetails = ({ template }: { template: Template }) => {
  const { execute, isPending } = useAction(deleteTemplate, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success(`Template deleted successfully`)
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to delete template: ${error.serverError}`)
    },
  })

  return (
    <Card>
      <CardContent className='flex h-24 w-full items-center justify-between gap-3 pt-4'>
        <div className='flex items-center gap-3'>
          <div>
            <p className='font-semibold'>{template.name}</p>
            <span className='text-sm text-muted-foreground'>
              {template?.description}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <Button
            disabled={isPending}
            onClick={() => {
              execute({ id: template.id })
            }}
            size='icon'
            variant='outline'>
            <Trash2 size={20} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default TemplateDetails
