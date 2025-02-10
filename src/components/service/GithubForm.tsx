'use client'

import { TabContentProps } from '../Tabs'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
import { useTerminal } from '@/providers/ServerTerminalProvider'

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

export const GithubForm = ({ setDisableTabs }: TabContentProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const { setOpen } = useTerminal()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      repository: 'https://github.com/tonykhbo/hello-world-nextjs.git',
      branch: 'main',
    },
  })

  const { execute: CreateAppGithubAction, isPending } = useAction(
    createAppGithubAction,
    {
      onExecute: () => {
        setDisableTabs(true)
      },
      onSuccess: ({ data }) => {
        if (data) {
          toast.success('Successfully triggered Github deployment', {
            duration: 2000,
            closeButton: true,
          })
          const closeButton = closeButtonRef.current

          if (closeButton) {
            closeButton.click()
          }

          setOpen(true)
        }
      },
      onError: ({ error }) => {
        toast.error(
          `Failed to trigger Github deployment ${error.serverError}`,
          {
            duration: 2000,
            closeButton: true,
          },
        )
      },
    },
  )

  function onSubmit(values: z.infer<typeof formSchema>) {
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

        <Button type='submit' disabled={isPending}>
          Deploy
        </Button>
      </form>
    </Form>
  )
}
