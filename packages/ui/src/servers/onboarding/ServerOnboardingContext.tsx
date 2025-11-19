'use client'

import React, { createContext, useContext, useState } from 'react'

type ServerOnboardingContextType = {
  currentStep: number
  totalSteps: number
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
  nextStep: () => void
  previousStep: () => void
}

const ServerOnboardingContext = createContext<
  ServerOnboardingContextType | undefined
>(undefined)

export const ServerOnboardingProvider = ({
  children,
  totalSteps = 2,
}: {
  children: React.ReactNode
  totalSteps?: number
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1)

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(current => current + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <ServerOnboardingContext.Provider
      value={{
        currentStep,
        totalSteps,
        setCurrentStep,
        nextStep,
        previousStep,
      }}>
      {children}
    </ServerOnboardingContext.Provider>
  )
}

export const useServerOnboarding = () => {
  const context = useContext(ServerOnboardingContext)

  if (!context) {
    throw new Error(
      'useServerOnboarding must be used within a ServerOnboardingProvider',
    )
  }

  return context
}
