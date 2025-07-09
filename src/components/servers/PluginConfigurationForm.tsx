import { PluginListType } from '../plugins'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { configureLetsencryptPluginAction } from '@/actions/plugin'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ServerType } from '@/payload-types-overrides'

const letsencryptPluginSchema = z.object({
  email: z.string().email({
    message: 'Email is invalid',
  }),
  autoGenerateSSL: z.boolean().default(false),
  serverId: z.string(),
})

export const LetsencryptForm = ({
  plugin,
  setOpen = () => {},
  serverId,
  userEmail,
}: {
  plugin: PluginListType | NonNullable<ServerType['plugins']>[number]
  setOpen?: Dispatch<SetStateAction<boolean>>
  serverId: string
  userEmail?: string
}) => {
  const defaultValues =
    'name' in plugin &&
    plugin.configuration &&
    !Array.isArray(plugin.configuration) &&
    typeof plugin.configuration === 'object'
      ? {
          email: plugin.configuration.email ?? '',
          autoGenerateSSL: plugin.configuration.autoGenerateSSL ?? true,
        }
      : {
          email: '',
          autoGenerateSSL: true,
        }

  const form = useForm<z.infer<typeof letsencryptPluginSchema>>({
    resolver: zodResolver(letsencryptPluginSchema),
    defaultValues: {
      email:
        (typeof defaultValues?.email === 'string' ? defaultValues.email : '') ||
        userEmail ||
        '',
      autoGenerateSSL: !!defaultValues?.autoGenerateSSL,
      serverId,
    },
  })

  useEffect(() => {
    if (userEmail && !defaultValues?.email) {
      form.setValue('email', userEmail)
    }
  }, [userEmail, form, defaultValues?.email])

  const { execute, isPending, hasSucceeded } = useAction(
    configureLetsencryptPluginAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.info('Added to queue', {
            description:
              'Added to updating letsencrypt plugin configuration to queue',
          })

          setOpen(false)
          form.reset()
        }
      },
      onError: ({ error }) => {
        toast.info(`Failed to update config: ${error.serverError}`)
      },
    },
  )

  function onSubmit(values: z.infer<typeof letsencryptPluginSchema>) {
    execute(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-6'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='autoGenerateSSL'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between gap-1 rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>
                  Auto Generate SSL Certificates
                </FormLabel>
                <FormDescription>
                  A cron-job will be added to automatically generate SSL
                  certificates
                </FormDescription>
              </div>

              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button
            disabled={isPending || hasSucceeded}
            isLoading={isPending}
            type='submit'>
            Save changes
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

const PluginConfigurationForm = ({
  children,
  plugin,
}: {
  children: React.ReactNode
  plugin: PluginListType | NonNullable<ServerType['plugins']>[number]
}) => {
  const pluginName = 'name' in plugin ? plugin.name : plugin.value
  const params = useParams<{ id: string }>()
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      {pluginName === 'letsencrypt' && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Letsencrypt configuration</DialogTitle>
            <DialogDescription>
              Add a email for SSL certificate issuance
            </DialogDescription>
          </DialogHeader>
          <LetsencryptForm
            plugin={plugin}
            setOpen={setOpen}
            serverId={params.id}
          />
        </DialogContent>
      )}
    </Dialog>
  )
}

export default PluginConfigurationForm
