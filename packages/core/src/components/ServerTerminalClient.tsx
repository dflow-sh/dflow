'use client'

import { Server } from '@core/payload-types'
import dynamic from 'next/dynamic'

// Dynamically import ServerTerminal with ssr: false
const ServerTerminal = dynamic(
  () => import('@core/components/ServerTerminal'),
  {
    ssr: false,
  },
)

interface ServerTerminalClientProps {
  servers: Server[] | { id: string; name: string }[]
}

const ServerTerminalClient = ({ servers }: ServerTerminalClientProps) => {
  return <ServerTerminal servers={servers} />
}

export default ServerTerminalClient
