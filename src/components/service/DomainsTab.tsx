import { Service } from '@/payload-types'

import DomainList from './DomainList'

const DomainsTab = ({
  domains,
  ip,
}: {
  domains: NonNullable<Service['domains']>
  ip: string
}) => {
  return (
    <DomainList domains={domains} ip={ip} />

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
  )
}

export default DomainsTab
