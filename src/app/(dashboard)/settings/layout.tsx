import React from 'react'

import LayoutClient from './layout.client'

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section>
      <LayoutClient>{children}</LayoutClient>
    </section>
  )
}

export default SettingsLayout
