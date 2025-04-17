'use client'

import { KeyRound, Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'

const SecuritySidebar = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className='sticky top-0 h-screen w-64 border-r pr-4'>
      <div className='py-6'>
        <h2 className='mb-4 px-2 text-lg font-semibold'>Security</h2>
        <div className='space-y-1'>
          <Button
            variant='ghost'
            className='w-full justify-start'
            onClick={() => scrollToSection('ssh-keys')}>
            <KeyRound className='mr-2 h-4 w-4' />
            SSH Keys
          </Button>
          <Button
            variant='ghost'
            className='w-full justify-start'
            onClick={() => scrollToSection('security-groups')}>
            <Shield className='mr-2 h-4 w-4' />
            Security Groups
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SecuritySidebar
