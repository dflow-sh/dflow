'use client'

import Terminal from '../Terminal'
import { Button } from '../ui/button'
import { DialogFooter } from '../ui/dialog'
import { Input } from '../ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { createAppGithubAction } from '@/actions/createAppGithub'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Convert spaces to hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric characters except hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name should be at-least than 1 character' })
    .max(50, { message: 'Name should be less than 50 characters' }),
  repository: z.string({ message: 'Repository is required' }),
  branch: z.string({ message: 'Branch is required' }),
})

export const GithubForm = () => {
  const [messages, setMessages] = useState<string[]>([])
  const [eventSource, setEventSource] = useState<EventSource>()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      repository: 'https://github.com/tonykhbo/hello-world-nextjs.git',
      branch: 'main',
    },
  })

  const { toast } = useToast()

  const { execute: CreateAppGithubAction, isPending } = useAction(
    createAppGithubAction,
    {
      onExecute: () => {
        const eventSourceInstance = new EventSource('/api/events')
        setEventSource(eventSourceInstance)

        eventSourceInstance.onmessage = event => {
          setMessages(prev => [...prev, event.data])
        }
      },
      onSuccess: ({ data }) => {
        if (data) {
          toast({
            title: 'Successful',
            description: 'Successfully created app',
          })
        }
      },
      onError: ({ error }) => {
        toast({
          title: 'Failed to create database',
          description: 'An unknown error occurred',
        })
      },
    },
  )

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    const userName = `${values.repository.split('/').at(-2)}`
    const repoName = `${values.repository.split('/').at(-1)?.replace('.git', '')}`

    CreateAppGithubAction({
      appName: values.name,
      branch: values.branch,
      repoName,
      userName,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-8'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={e => {
                    const formattedName = slugify(e.target.value)
                    form.setValue('name', formattedName, {
                      shouldValidate: true,
                    })
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='repository'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repository</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='branch'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <p className='text-sm font-medium'>Terminal</p>
          <Terminal className='mt-1.5 h-60' messages={messages} />
        </div>

        <DialogFooter>
          <Button type='submit' disabled={isPending}>
            Create database
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
