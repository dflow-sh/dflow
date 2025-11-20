'use client'

import React, { createContext, use, useState } from 'react'

type DisableDeploymentContextType = {
  disable: boolean
  setDisable: React.Dispatch<React.SetStateAction<boolean>>
}

const DisableDeploymentContext = createContext<
  DisableDeploymentContextType | undefined
>(undefined)

export const DisableDeploymentContextProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [disable, setDisable] = useState(false)

  return (
    <DisableDeploymentContext.Provider value={{ disable, setDisable }}>
      {children}
    </DisableDeploymentContext.Provider>
  )
}

export const useDisableDeploymentContext = () => {
  const context = use(DisableDeploymentContext)

  if (context === undefined) {
    throw new Error(
      'useDisableDeploymentContext must be used within a DisableDeploymentContextProvider',
    )
  }

  return context
}
