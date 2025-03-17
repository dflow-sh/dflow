'use client'

import { RefreshCcw } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

const NetdataInstallPrompt = () => {
  return (
    <>
      <Alert variant='destructive'>
        <RefreshCcw className='h-4 w-4' />
        <AlertTitle>Netdata is not installed!</AlertTitle>
        <AlertDescription className='flex w-full flex-col justify-between gap-2 md:flex-row'>
          <p>Netdata is required for monitoring. Install it to proceed.</p>
          <Button disabled={false} onClick={() => {}}>
            Install Netdata
          </Button>
        </AlertDescription>
      </Alert>
    </>
  )
}

export default NetdataInstallPrompt
