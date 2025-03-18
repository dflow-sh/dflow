import configPromise from '@payload-config'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import { CreateSSHKeyForm } from '@/components/sshkeys/CreateSSHKeyForm'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const sshKeys = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  if (sshKeys.docs.length > 0) {
    redirect('/onboarding/add-server')
  }

  return (
    <Suspense fallback={<Loader />}>
      <div className='mx-auto flex h-screen flex-col items-center justify-center px-5'>
        <Card className='w-[750px]'>
          <CardHeader>
            <div className='flex items-center text-sm font-extralight tracking-wide text-foreground'>
              <ArrowLeft className='mr-2 inline-block' size={16} />
              <div>
                STEP <span className='font-medium'>1</span> OF{' '}
                <span className='font-medium'>5</span>
              </div>
            </div>
            <div className='mb-4 mt-1.5 text-3xl font-semibold tracking-wide'>
              Generate SSH Keys
            </div>
          </CardHeader>

          {/* <StepperComponent /> */}

          <CardContent>
            <CreateSSHKeyForm />
          </CardContent>
        </Card>
      </div>
    </Suspense>
  )
}
