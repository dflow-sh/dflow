'use client'

import { useAction } from 'next-safe-action/hooks'
import React, { createContext, use } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { templateDeployAction } from '@/actions/templates'
import { deployTemplateFromArchitectureSchema } from '@/actions/templates/validator'

type ArchitectureContextType = {
  deploy: (params: z.infer<typeof deployTemplateFromArchitectureSchema>) => void
  isDeploying: boolean
}

const ArchitectureContext = createContext<ArchitectureContextType | undefined>(
  undefined,
)

export const ArchitectureContextProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { execute, isPending } = useAction(templateDeployAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success('Added to queue', {
          description: 'Added deploying architecture to queue',
        })
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to deploy architecture: ${error.serverError}`)
    },
  })

  return (
    <ArchitectureContext.Provider
      value={{ deploy: execute, isDeploying: isPending }}>
      {children}
    </ArchitectureContext.Provider>
  )
}

export const useArchitectureContext = () => {
  const context = use(ArchitectureContext)

  if (context === undefined) {
    throw new Error(
      'useArchitectureContext must be used within a ArchitectureContextProvider',
    )
  }

  return context
}
