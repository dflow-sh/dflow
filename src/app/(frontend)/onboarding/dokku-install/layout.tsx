import { DokkuInstallationStepContextProvider } from '@/components/onboarding/dokkuInstallation/DokkuInstallationStepContext'

export default function DokkuInstallationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DokkuInstallationStepContextProvider>
      {children}
    </DokkuInstallationStepContextProvider>
  )
}
