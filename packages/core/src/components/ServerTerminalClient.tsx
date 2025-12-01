'use client'

import dynamic from 'next/dynamic'

import { Server } from '@dflow/core/payload-types'

// Dynamically import ServerTerminal with ssr: false
const ServerTerminal = dynamic(() => import('@dflow/core/components/ServerTerminal'), {
  ssr: false,
})

interface ServerTerminalClientProps {
  servers: Server[] | { id: string; name: string }[]
}

const ServerTerminalClient = ({ servers }: ServerTerminalClientProps) => {
  return <ServerTerminal servers={servers} />
}

export default ServerTerminalClient
