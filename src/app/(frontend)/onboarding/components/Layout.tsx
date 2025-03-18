import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export default async function Layout({
  currentStep,
  cardTitle,
  prevStepUrl,
  nextStepUrl,
  disableNextStep,
  children,
}: {
  currentStep: number
  cardTitle: string
  prevStepUrl: string
  nextStepUrl: string
  disableNextStep: boolean
  children?: React.ReactNode
}) {
  console.log('disabled : ', disableNextStep)

  return (
    <div className='mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-5'>
      <Card className='w-full max-w-[750px]'>
        <CardHeader>
          <div className='flex items-center gap-2 text-sm font-extralight tracking-wide text-foreground'>
            <div>
              STEP <span className='font-medium'>{currentStep}</span> OF{' '}
              <span className='font-medium'>5</span>
            </div>
          </div>
          <div className='mb-4 mt-1.5 text-3xl font-semibold tracking-wide'>
            {cardTitle}
          </div>
        </CardHeader>

        <CardContent>{children}</CardContent>

        <CardFooter className='mt-4 flex justify-between border-t pt-4'>
          {prevStepUrl && (
            <Button variant={'outline'} size={'icon'} asChild>
              <Link href={prevStepUrl}>
                <ChevronLeft size={24} />
              </Link>
            </Button>
          )}

          <div className='flex-1' />

          {nextStepUrl && disableNextStep ? (
            <Button variant={'outline'} size={'icon'} asChild>
              <Link href={nextStepUrl}>
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
