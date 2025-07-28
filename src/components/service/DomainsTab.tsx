import { Server, Service } from '@/payload-types'

import DomainList from './DomainList'
import { Globe } from 'lucide-react'

const DomainsTab = ({
  domains,
  ip,
  server,
  service,
}: {
  domains: NonNullable<Service['domains']>
  ip: string
  server: Server | null
  service: Service
}) => {
  return (
    <>
      <div className='flex items-center gap-1.5 mb-4'>
        <Globe />
        <h4 className='text-lg font-semibold'>Domains</h4>
      </div>
      <DomainList domains={domains} ip={ip} server={server} service={service} />

      // <Tabs defaultValue='domains'>
      //   <TabsList className='mb-2'>
      //     <TabsTrigger value='domains'>Domains</TabsTrigger>
      //     <TabsTrigger value='traefikConfiguration'>
      //       Traefik Configuration
      //     </TabsTrigger>
      //   </TabsList>

      //   <TabsContent value='domains'>
      //     <DomainList domains={domains} ip={ip} />
      //   </TabsContent>

      //   <TabsContent value='traefikConfiguration'>
      //     <TraefikConfiguration />
      //   </TabsContent>
      // </Tabs>
    </>
  )
}

export default DomainsTab
