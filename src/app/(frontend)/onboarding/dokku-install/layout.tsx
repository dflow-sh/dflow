import { InstallationStepContextProvider } from '@/components/onboarding/dokkuInstallation/InstallationStepContext'

export default function DokkuInstallationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <InstallationStepContextProvider>
      {children}
    </InstallationStepContextProvider>
  )
}
