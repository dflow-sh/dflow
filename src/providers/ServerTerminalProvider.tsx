'use client'

import React, { createContext, use, useState } from 'react'

type ServerTerminalContextType = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const ServerTerminalContext = createContext<
  ServerTerminalContextType | undefined
>(undefined)

export const ServerTerminalProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <ServerTerminalContext.Provider value={{ open, setOpen }}>
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
