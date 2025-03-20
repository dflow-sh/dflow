'use client'

import React, { createContext, use, useState } from 'react'

type UserContextType = {
  step: number
  setStep: React.Dispatch<React.SetStateAction<number>>
}

const InstallationStepContext = createContext<UserContextType | undefined>(
  undefined,
)

export const InstallationStepContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [step, setStep] = useState<number>(1)

  return (
    <InstallationStepContext.Provider value={{ step, setStep }}>
      {children}
    </InstallationStepContext.Provider>
  )
}

export const useInstallationStep = () => {
  const context = use(InstallationStepContext)

  if (context === undefined) {
    throw new Error(
      'useInstallationStep must be used within a InstallationStepContextProvider',
    )
  }

  return context
}
