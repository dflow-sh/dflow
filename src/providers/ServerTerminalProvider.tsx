'use client'

import React, { createContext, use, useState } from 'react'

type ServerTerminalContextType = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  serverId: string
  setServerId: React.Dispatch<React.SetStateAction<string>>
  serviceId: string
  setServiceId: React.Dispatch<React.SetStateAction<string>>
}

const ServerTerminalContext = createContext<
  ServerTerminalContextType | undefined
>(undefined)

export const ServerTerminalProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [serverId, setServerId] = useState('')
  const [serviceId, setServiceId] = useState('')

  return (
    <ServerTerminalContext.Provider
      value={{ open, setOpen, serverId, setServerId, serviceId, setServiceId }}>
      {children}
    </ServerTerminalContext.Provider>
  )
}

export const useTerminal = () => {
  const context = use(ServerTerminalContext)

  if (context === undefined) {
    throw new Error('useUser must be used within a ServerTerminalProvider')
  }

  return context
}
