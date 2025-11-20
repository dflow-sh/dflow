'use client'

import RefreshButton from '../RefreshButton'
import { PluginListType, pluginList } from '../plugins'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'
import {
  Download,
  LucideIcon,
  Plug2,
  RefreshCcw,
  Settings,
  Trash2,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { JSX, SVGProps, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  checkPluginUsageAction,
  deletePluginAction,
  installPluginAction,
  syncPluginAction,
  togglePluginStatusAction,
} from '@/actions/plugin'
import { supportedPluginsSchema } from '@/actions/plugin/validator'
import {
  ClickHouse,
  Letsencrypt,
  MariaDB,
  MongoDB,
  MySQL,
  PostgreSQL,
  RabbitMQ,
  Redis,
} from '@/components/icons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ServerType } from '@/payload-types-overrides'

import PluginConfigurationForm from './PluginConfigurationForm'
import { PluginUninstallDialog } from './PluginUninstallDialog'

// Job Queued
// Queued job to install plugin

const groupBy = ({
  items,
  key,
}: {
  items: PluginListType[]
  key: keyof PluginListType
}) =>
  items.reduce(
    (result, item) => ({
      ...result,
      [item[key] as string]: [...(result[item[key] as string] || []), item],
    }),
    {} as Record<string, PluginListType[]>,
  )

const iconMapping: {
  [key in z.infer<typeof supportedPluginsSchema>]:
    | LucideIcon
    | ((props: SVGProps<SVGSVGElement>) => JSX.Element)
} = {
  postgres: PostgreSQL,
  rabbitmq: RabbitMQ,
  letsencrypt: Letsencrypt,
  mariadb: MariaDB,
  mongo: MongoDB,
  redis: Redis,
  mysql: MySQL,
  clickhouse: ClickHouse,
}

const PluginCard = ({
  plugin,
  server,
  category,
  organisationSlug,
}: {
  plugin: PluginListType | NonNullable<ServerType['plugins']>[number]
  server: ServerType
  category: string
  organisationSlug: string
}) => {
  const [showUninstallDialog, setShowUninstallDialog] = useState(false)
  const [usageData, setUsageData] = useState<{
    inUse: boolean
    services: any[]
  } | null>(null)

  const {
    execute: installPlugin,
    isPending: isInstallingPlugin,
    hasSucceeded: triggeredPluginInstall,
  } = useAction(installPluginAction, {
    onSuccess: ({ data, input }) => {
      if (data?.success) {
        toast.info('Job queued', {
          description: `Queued job to install ${input.pluginName} plugin`,
        })
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to install plugin: ${error.serverError}`)
    },
  })

  const {
    execute: deletePlugin,
    isPending: isDeletingPlugin,
    hasSucceeded: triggeredPluginDeletion,
  } = useAction(deletePluginAction, {
    onSuccess: ({ data, input }) => {
      if (data?.success) {
        toast.info('Job queued', {
          description: `Queued job to uninstall ${input.pluginName} plugin`,
        })
        setShowUninstallDialog(false)
        setUsageData(null)
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to delete plugin: ${error?.serverError}`)
      setShowUninstallDialog(false)
    },
  })

  const { execute: checkPluginUsage, isPending: isCheckingUsage } = useAction(
    checkPluginUsageAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          setUsageData({
            inUse: data.inUse,
            services: data.services,
          })
          setShowUninstallDialog(true)
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to check plugin usage: ${error?.serverError}`)
      },
    },
  )

  const { execute: togglePluginStatus, isPending: isUpdatingPluginStatus } =
    useAction(togglePluginStatusAction, {
      onSuccess: ({ data, input }) => {
        if (data?.success) {
          toast.info('Added to queue', {
            description: `Added ${input.pluginName} update to queue`,
          })
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to update plugin: ${error?.serverError}`)
      },
    })

  const handlePluginUninstall = () => {
    if (notCustomPlugin) {
      checkPluginUsage({
        serverId: params.serverId,
        category,
        pluginName: plugin.value,
        connectionType: server.preferConnectionType,
      })
    }
  }

  const handleConfirmUninstall = () => {
    if (notCustomPlugin) {
      deletePlugin({
        pluginName: plugin.value,
        pluginURL: plugin.githubURL,
        serverId: params.serverId,
      })
    }
  }

  const handleCloseDialog = () => {
    setShowUninstallDialog(false)
    setUsageData(null)
  }

  const params = useParams<{ serverId: string }>()
  const defaultPlugins = server.plugins ?? []
  const notCustomPlugin = 'value' in plugin
  const pluginName = notCustomPlugin ? plugin.value : plugin.name

  const installedPlugin = notCustomPlugin
    ? defaultPlugins.find(defaultPlugin => defaultPlugin.name === plugin.value)
    : plugin

  const Icon = 'value' in plugin ? iconMapping[plugin.value] : Plug2

  const isPluginEnabled = installedPlugin?.status === 'enabled'

  return (
    <>
      <Card className='h-full' key={pluginName}>
        <CardHeader className='w-full flex-row items-start justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Icon className='size-5' />
              {pluginName}

              {installedPlugin && (
                <code className='text-muted-foreground font-normal'>
                  {`(${installedPlugin.version})`}
                </code>
              )}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent
          className={`flex w-full items-center justify-between pt-4`}>
          {installedPlugin ? (
            <div className='flex w-full items-center justify-between'>
              <div className='space-x-2'>
                <Button
                  variant='outline'
                  disabled={
                    !notCustomPlugin ||
                    isDeletingPlugin ||
                    triggeredPluginDeletion ||
                    isCheckingUsage
                  }
                  onClick={handlePluginUninstall}>
                  <Trash2 />
                  {isCheckingUsage
                    ? 'Checking...'
                    : isDeletingPlugin || triggeredPluginDeletion
                      ? 'Uninstalling...'
                      : 'Uninstall'}
                </Button>

                {'hasConfig' in plugin && plugin.hasConfig && (
                  <PluginConfigurationForm plugin={installedPlugin}>
                    <Button variant='outline' size='icon'>
                      <Settings />
                    </Button>
                  </PluginConfigurationForm>
                )}
              </div>

              {/* Switch to enable plugin (disable functionality restricted) */}
              <Switch
                disabled={
                  !notCustomPlugin || isUpdatingPluginStatus || isPluginEnabled // Disable switch when plugin is already enabled
                }
                checked={isPluginEnabled}
                onCheckedChange={enabled => {
                  // Only allow enabling, not disabling
                  if (enabled && notCustomPlugin) {
                    togglePluginStatus({
                      pluginName: plugin.value,
                      pluginURL: plugin.githubURL,
                      enabled: true,
                      serverId: server.id,
                    })
                  } else if (!enabled) {
                    // Show a toast message when user tries to disable
                    toast.warning('Plugin cannot be disabled', {
                      description:
                        'Use the uninstall button to remove the plugin',
                    })
                  }
                }}
              />
            </div>
          ) : (
            <Button
              variant='outline'
              disabled={isInstallingPlugin || triggeredPluginInstall}
              isLoading={isInstallingPlugin}
              onClick={() => {
                if (notCustomPlugin) {
                  installPlugin({
                    pluginName: plugin.value,
                    pluginURL: plugin.githubURL,
                    serverId: params.serverId,
                  })
                }
              }}>
              <Download />
              {triggeredPluginInstall ? 'Installing' : 'Install'}
            </Button>
          )}

          {/* For now only uninstall is enough */}
          {/* {installedPlugin && (
            <Switch
              disabled={!notCustomPlugin || isUpdatingPluginStatus}
              defaultChecked={installedPlugin.status === 'enabled'}
              onCheckedChange={enabled => {
                if (notCustomPlugin) {
                  togglePluginStatus({
                    pluginName: plugin.value,
                    pluginURL: plugin.githubURL,
                    enabled,
                    serverId: server.id,
                  })
                }
              }}
            />
          )} */}
        </CardContent>
      </Card>

      <PluginUninstallDialog
        isOpen={showUninstallDialog}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmUninstall}
        pluginName={pluginName}
        category={category}
        usageData={usageData}
        isLoading={isDeletingPlugin}
        organisationSlug={organisationSlug}
      />
    </>
  )
}

const PluginSection = ({
  title,
  plugins,
  server,
  organisationSlug,
}: {
  title: string
  plugins: PluginListType[] | NonNullable<ServerType['plugins']>
  server: ServerType
  organisationSlug: string
}) => {
  return (
    <div className='space-y-2 pt-2'>
      <h5 className='font-semibold capitalize'>{title}</h5>
      <div className='grid gap-x-4 gap-y-8 md:grid-cols-3'>
        {plugins.map((plugin, index) => {
          return (
            <PluginCard
              plugin={plugin}
              key={index}
              server={server}
              category={title}
              organisationSlug={organisationSlug}
            />
          )
        })}
      </div>
    </div>
  )
}

const PluginsList = ({
  server,
  organisationSlug,
}: {
  server: ServerType
  organisationSlug: string
}) => {
  const { execute, isPending } = useAction(syncPluginAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success('Successfully synced plugins')
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to sync plugins: ${error?.serverError}`)
    },
  })

  const customPlugins = server.plugins
    ? server?.plugins.filter(({ name }) => {
        const pluginExists = pluginList.find(plugin => plugin.value === name)

        return !pluginExists
      })
    : []

  const FormattedPlugins = Object.entries(
    groupBy({ items: pluginList, key: 'category' }),
  )

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h4 className='text-lg font-semibold'>Plugins</h4>
        <RefreshButton showText={true} text='Refresh Server Status' />
      </div>

      <Alert variant='info'>
        <RefreshCcw className='h-4 w-4' />
        <AlertTitle>Sync Plugins</AlertTitle>
        <AlertDescription className='flex w-full flex-col justify-between gap-2 md:flex-row'>
          <p>Sync the existing dokku plugins installed on server</p>
          <Button
            disabled={isPending}
            isLoading={isPending}
            onClick={() => execute({ serverId: server.id })}
            variant='secondary'>
            Sync Plugins
          </Button>
        </AlertDescription>
      </Alert>

      {FormattedPlugins.map(([category, list]) => (
        <PluginSection
          title={category}
          server={server}
          plugins={list}
          organisationSlug={organisationSlug}
          key={category}
        />
      ))}

      {customPlugins.length ? (
        <PluginSection
          title='Custom Plugins'
          server={server}
          plugins={customPlugins}
          organisationSlug={organisationSlug}
        />
      ) : null}
    </div>
  )
}

export default PluginsList
