import { PluginListType } from '../plugins'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { Dispatch, SetStateAction, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { configureLetsencryptPluginAction } from '@/actions/plugin'
import { configureLetsencryptPluginSchema } from '@/actions/plugin/validator'
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

const letsencryptFormSchema = z.object({
  email: z.string().email({
    message: 'Email is invalid',
  }),
  autoGenerateSSL: z.boolean().default(false),
})

const LetsencryptForm = ({
  plugin,
  setOpen,
}: {
  plugin: PluginListType | NonNullable<ServerType['plugins']>[number]
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const params = useParams<{ id: string }>()

  const defaultValues =
    'name' in plugin &&
    plugin.configuration &&
    !Array.isArray(plugin.configuration) &&
    typeof plugin.configuration === 'object'
      ? {
          email: plugin.configuration.email,
          autoGenerateSSL: plugin.configuration.autoGenerateSSL,
        }
      : undefined

  const form = useForm<z.infer<typeof configureLetsencryptPluginSchema>>({
    resolver: zodResolver(configureLetsencryptPluginSchema),
    defaultValues: {
      email:
        typeof defaultValues?.email === 'string' ? defaultValues.email : '',
      autoGenerateSSL: !!defaultValues?.autoGenerateSSL,
      serverId: params.id,
    },
  })

  const { execute, isPending } = useAction(configureLetsencryptPluginAction, {
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
  })

  function onSubmit(values: z.infer<typeof configureLetsencryptPluginSchema>) {
    console.log({ values })
    execute(values)
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Letsencrypt configuration</DialogTitle>
        <DialogDescription>
          Add a email for SSL certificate issuance
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-8'>
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
            <Button disabled={isPending} type='submit'>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
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
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      {pluginName === 'letsencrypt' && (
        <LetsencryptForm plugin={plugin} setOpen={setOpen} />
      )}
    </Dialog>
  )
}

export default PluginConfigurationForm
