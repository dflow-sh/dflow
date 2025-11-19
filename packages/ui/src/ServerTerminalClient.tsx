'use client'

import dynamic from 'next/dynamic'

import { Server } from '@/payload-types'

// Dynamically import ServerTerminal with ssr: false
const ServerTerminal = dynamic(() => import('@/components/ServerTerminal'), {
  ssr: false,
})

interface ServerTerminalClientProps {
  servers: Server[] | { id: string; name: string }[]
}

const ServerTerminalClient = ({ servers }: ServerTerminalClientProps) => {
  return <ServerTerminal servers={servers} />
}

export default ServerTerminalClient
