import SidebarToggleButton from '../SidebarToggleButton'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export default async function Layout({
  currentStep,
  cardTitle,
  cardDescription = '',
  prevStepUrl,
  nextStepUrl,
  disableNextStep,
  children,
}: {
  currentStep: number
  cardTitle: string
  cardDescription?: string
  prevStepUrl: string
  nextStepUrl: string
  disableNextStep: boolean
  children?: React.ReactNode
}) {
  return (
    <div className='mx-auto flex min-h-screen w-full flex-col items-center justify-center gap-4 px-5'>
      <div className='mt-20 flex items-center gap-2 text-2xl font-semibold'>
        {/* <Workflow className='text-primary' /> */}
        <Image
          src='/images/dflow-no-bg.png'
          alt='dFlow-logo'
          width={32}
          height={32}
          className='object-contain'
        />
        <p>dFlow Onboarding</p>
      </div>

      <Card className='mb-20 w-full max-w-4xl'>
        <CardHeader>
          <div className='flex items-center justify-between gap-2 text-sm font-extralight tracking-wide text-foreground'>
            <div>
              STEP <span className='font-medium'>{currentStep}</span> OF{' '}
              <span className='font-medium'>5</span>
            </div>
            <SidebarToggleButton directory='onboarding' fileName='onboarding' />
          </div>
          <div className='mt-1.5 text-3xl font-semibold tracking-wide'>
            {cardTitle}
          </div>
          <div className='text-sm text-muted-foreground'>{cardDescription}</div>
        </CardHeader>

        <CardContent>{children}</CardContent>

        <CardFooter className='mt-4 flex justify-between border-t pt-4'>
          {prevStepUrl && (
            <Button variant={'outline'} size={'icon'} asChild>
              <Link href={prevStepUrl} id='previous-step'>
                <ChevronLeft size={24} />
              </Link>
            </Button>
          )}

          <div className='flex-1' />

          {nextStepUrl && disableNextStep ? (
            <Button variant={'outline'} size={'icon'} asChild>
              <Link href={nextStepUrl} id='next-step'>
                <ChevronRight size={24} />
              </Link>
            </Button>
          ) : (
            <Button variant={'outline'} size={'icon'} disabled>
              <ChevronRight size={24} />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
