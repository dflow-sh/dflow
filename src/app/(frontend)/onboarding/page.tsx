import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  redirect('/onboarding/ssh-keys')
}
