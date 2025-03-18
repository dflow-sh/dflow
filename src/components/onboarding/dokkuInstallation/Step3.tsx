'use client'

import { pluginList } from '@/components/plugins'
import { LetsencryptForm } from '@/components/servers/PluginConfigurationForm'
import { ServerType } from '@/payload-types-overrides'

const Step3 = ({ server }: { server: ServerType }) => {
  const plugins = server.plugins ?? []
  const letsencryptPluginDetails = plugins.find(
    plugin => plugin.name === 'letsencrypt',
  )
  const plugin = pluginList.filter(plugin => plugin.value === 'letsencrypt')[0]

  return <LetsencryptForm plugin={letsencryptPluginDetails ?? plugin} />
}

export default Step3
