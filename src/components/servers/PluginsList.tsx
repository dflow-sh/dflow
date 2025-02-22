'use client'

import { PluginType, plugins } from '../plugins'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'
import { Download, RefreshCcw, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

import {
  installPluginAction,
  syncPluginAction,
  togglePluginStatusAction,
} from '@/actions/plugin'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ServerType } from '@/payload-types-overrides'

const PluginCard = ({
  plugin,
  server,
}: {
  plugin: PluginType
  server: ServerType
}) => {
  const { execute: installPlugin, isPending: isInstallingPlugin } = useAction(
    installPluginAction,
    {
      onSuccess: ({ data, input }) => {
        if (data?.success) {
          toast.success(`Successfully installed ${input.plugin} plugin`)
        }
      },
    },
  )

  const { execute: togglePluginStatus, isPending: isUpdatingPluginStatus } =
    useAction(togglePluginStatusAction, {
      onSuccess: ({ data, input }) => {
        if (data?.success) {
          toast.success(
            `Successfully ${input.enabled ? 'enabled' : 'disabled'} ${input.plugin} plugin`,
          )
        }
      },
    })

  const params = useParams<{ id: string }>()
  const defaultPlugins = server.plugins ?? []

  const installedPlugin = defaultPlugins.find(
    defaultPlugin => defaultPlugin.name === plugin.value,
  )

  return (
    <Card className='h-full' key={plugin.value}>
      <CardHeader className='w-full flex-row items-start justify-between'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <plugin.icon className='size-5' />
            {plugin.label}

            {installedPlugin && (
              <code className='font-normal text-muted-foreground'>
                {`(${installedPlugin.version})`}
              </code>
            )}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent
        className={`flex w-full items-center pt-4 ${installedPlugin ? 'justify-between' : 'justify-end'} `}>
        {installedPlugin && (
          <Switch
            disabled={isUpdatingPluginStatus}
            defaultChecked={installedPlugin.status === 'enabled'}
            onCheckedChange={enabled => {
              togglePluginStatus({
                plugin: plugin.value,
                enabled,
                serverId: server.id,
              })
            }}
          />
        )}

        {installedPlugin ? (
          <Button variant='outline'>
            <Trash2 />
            Uninstall
          </Button>
        ) : (
          <Button
            variant='outline'
            disabled={isInstallingPlugin}
            onClick={() => {
              installPlugin({ plugin: plugin.value, serverId: params.id })
            }}>
            <Download />
            Install
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

const PluginSection = ({
  title,
  plugins,
  server,
}: {
  title: string
  plugins: PluginType[]
  server: ServerType
}) => {
  return (
    <div className='space-y-2 pt-2'>
      <h5 className='font-semibold'>{title}</h5>
      <div className='grid gap-4 md:grid-cols-3'>
        {plugins.map(plugin => {
          return (
            <PluginCard plugin={plugin} key={plugin.value} server={server} />
          )
        })}
      </div>
    </div>
  )
}

const PluginsList = ({ server }: { server: ServerType }) => {
  const { execute, isPending } = useAction(syncPluginAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success('Successfully synced plugins')
      }
    },
  })
  return (
    <div className='space-y-4 rounded bg-muted/30 p-4'>
      <h4 className='text-lg font-semibold'>Plugins</h4>

      <Alert variant='info'>
        <RefreshCcw className='h-4 w-4' />
        <AlertTitle>Sync Plugins</AlertTitle>
        <AlertDescription className='flex w-full flex-col justify-between gap-2 md:flex-row'>
          <p>Sync the existing dokku plugins installed on server</p>
          <Button
            disabled={isPending}
            onClick={() => execute({ serverId: server.id })}
            variant='secondary'>
            Sync Plugins
          </Button>
        </AlertDescription>
      </Alert>

      <PluginSection
        title='Databases'
        server={server}
        plugins={plugins.database}
      />
      <PluginSection title='Domain' server={server} plugins={plugins.domain} />
      <PluginSection
        title='Message Queue'
        server={server}
        plugins={plugins.messageQueue}
      />
    </div>
  )
}

export default PluginsList
