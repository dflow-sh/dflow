'use client'

import React from 'react'

import InstallationTerminal from '@/components/onboarding/dokkuInstallation/InstallationTerminal'

const ClientPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <InstallationTerminal />
      {children}
    </>
  )
}

export default ClientPage
