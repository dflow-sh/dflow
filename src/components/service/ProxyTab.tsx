import { Nginx, Traefik } from '../icons'
import { ArrowRightLeft } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Service } from '@/payload-types'

import NginxConfigurationTab from './NginxConfigurationTab'

const ProxyTab = ({
  proxyData,
  service,
}: {
  proxyData: { key: string; value: string }[]
  service: Service
}) => {
  return (
    <div className='space-y-8'>
      <div className='mb-4 flex w-full items-center gap-1.5'>
        <ArrowRightLeft />
        <h4 className='text-lg font-semibold'>Proxy</h4>
      </div>

      <Tabs defaultValue='nginx'>
        <TabsList>
          <TabsTrigger value='nginx'>
            <Nginx className='mr-1.5 size-4' />
            Nginx
          </TabsTrigger>

          <TabsTrigger value='traefik' disabled>
            <Traefik className='mr-1.5 size-4' />
            Traefik
          </TabsTrigger>
        </TabsList>

        <TabsContent value='nginx' className='mt-4'>
          <NginxConfigurationTab service={service} proxyData={proxyData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProxyTab
