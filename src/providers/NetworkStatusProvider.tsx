'use client'

import React, { createContext, use, useEffect } from 'react'
import { toast } from 'sonner'

type NetworkStatusContextType = {
  isOnline: boolean
}

const NetworkStatusContext = createContext<
  NetworkStatusContextType | undefined
>(undefined)

// showing toaster when user goes to offline & online
export const NetworkStatusProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [isOnline, setIsOnline] = React.useState(false)

  const handleOnline = () => {
    setIsOnline(true)
    toast.success("You're back online")
  }

  const handleOffline = () => {
    setIsOnline(false)
    toast.error('No internet connection')
  }

  useEffect(() => {
    if (window.navigator.onLine) {
      setIsOnline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <NetworkStatusContext.Provider value={{ isOnline }}>
      {children}
    </NetworkStatusContext.Provider>
  )
}

export const useNetworkStatusContext = () => {
  const context = use(NetworkStatusContext)

  if (context === undefined) {
    throw new Error(
      'useNetworkStatusContext must be used within a NetworkStatusContextProvider',
    )
  }

  return context
}
