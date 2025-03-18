import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default async function Layout({
  currentStep,
  cardTitle,
  prevStepUrl,
  children,
}: {
  currentStep: number
  cardTitle: string
  prevStepUrl: string
  children?: React.ReactNode
}) {
  return (
    <div className='mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-5'>
      <Card className='w-full max-w-[750px]'>
        <CardHeader>
          <div className='flex items-center text-sm font-extralight tracking-wide text-foreground'>
            {prevStepUrl !== '' && (
              <Button variant={'ghost'} size={'icon'} asChild>
                <Link href={prevStepUrl} className='text-base'>
                  <ArrowLeft className='inline-block' size={16} />
                </Link>
              </Button>
            )}
            <div className='ml-2'>
              STEP <span className='font-medium'>{currentStep}</span> OF{' '}
              <span className='font-medium'>5</span>
            </div>
          </div>
          <div className='mb-4 ml-2 mt-1.5 text-3xl font-semibold tracking-wide'>
            {cardTitle}
          </div>
        </CardHeader>

        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}
