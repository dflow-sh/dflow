'use client'

import { useAction } from 'next-safe-action/hooks'
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { getServersWithFieldsAction } from '@/actions/server'

interface Server {
  id: string
  name: string
}

type ServersContextType = {
  servers: Server[]
  refresh: () => void
  loading: boolean
  error: string | null
}

const ServersContext = createContext<ServersContextType | undefined>(undefined)

export function useServers() {
  const context = useContext(ServersContext)

  if (!context) {
    throw new Error('useServers must be used within a ServersProvider')
  }

  return context
}

export function ServersProvider({ children }: { children: ReactNode }) {
  const [servers, setServers] = useState<Server[]>([])
  const [error, setError] = useState<string | null>(null)

  const { execute, isPending } = useAction(getServersWithFieldsAction, {
    onSuccess({ data }) {
      setServers(data ?? [])
      setError(null)
    },
    onError({ error }) {
      setError(error?.serverError ?? 'Failed to load servers')
    },
  })

  const refresh = () => {
    execute({ fields: { name: true, connection: true } }) // No input = default { name: true }
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <ServersContext.Provider
      value={{ servers, refresh, loading: isPending, error }}>
      {children}
    </ServersContext.Provider>
  )
}
