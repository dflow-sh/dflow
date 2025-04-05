'use client'

import React, { createContext, useContext, useState } from 'react'

type DokkuInstallationStepContextType = {
  dokkuInstallationStep: number
  setDokkuInstallationStep: React.Dispatch<React.SetStateAction<number>>
}

const DokkuInstallationStepContext = createContext<
  DokkuInstallationStepContextType | undefined
>(undefined)

export const DokkuInstallationStepContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [dokkuInstallationStep, setDokkuInstallationStep] = useState<number>(1)

  return (
    <DokkuInstallationStepContext.Provider
      value={{ dokkuInstallationStep, setDokkuInstallationStep }}>
      {children}
    </DokkuInstallationStepContext.Provider>
  )
}

export const useDokkuInstallationStep = () => {
  const context = useContext(DokkuInstallationStepContext)

  if (!context) {
    throw new Error(
      'useDokkuInstallationStep must be used within a DokkuInstallationStepProvider',
    )
  }

  return context
}
