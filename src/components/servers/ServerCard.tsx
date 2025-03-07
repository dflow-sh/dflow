import { HardDrive } from 'lucide-react'
import Link from 'next/link'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Server } from '@/payload-types'

const ServerCard = ({ server }: { server: Server }) => {
  return (
    <Link href={`/settings/servers/${server.id}`} className='h-full'>
      <Card className='h-full min-h-36'>
        <CardHeader className='w-full flex-row items-start justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <HardDrive />
              {server.name}
            </CardTitle>
            <CardDescription>{server.description}</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <p>{server.ip}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default ServerCard
