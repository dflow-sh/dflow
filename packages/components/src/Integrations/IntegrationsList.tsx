'use client'

import { Settings } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { parseAsString, useQueryState } from 'nuqs'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { integrationsList } from '@dflow/shared/integrationList'

const IntegrationsList = () => {
  const [_, setActiveSlide] = useQueryState(
    'active',
    parseAsString.withDefault(''),
  )

  return (
    <div className='mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      <AnimatePresence mode='popLayout'>
        {integrationsList.map((integration, index) => (
          <motion.div
            key={integration.label}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
              transition: { duration: 0.2 },
            }}
            transition={{
              duration: 0.4,
              delay: index * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}>
            <Card className='h-full'>
              <CardHeader className='pb-2'>
                <div className='mb-2 flex size-14 items-center justify-center rounded-md border'>
                  <div className='relative'>
                    <integration.icon className='size-8 blur-lg saturate-200' />
                    <integration.icon className='absolute inset-0 size-8' />
                  </div>
                </div>

                <CardTitle className='inline-flex gap-2'>
                  {integration.label}
                  <div className='relative'>
                    {!integration.live && (
                      <Badge className='absolute -top-1 w-max'>
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className='text-muted-foreground min-h-24'>
                {integration.description}
              </CardContent>

              <CardFooter className='border-t py-4'>
                <Button
                  variant={'outline'}
                  onClick={() => {
                    setActiveSlide(integration.slug)
                  }}
                  disabled={!integration.live}>
                  <Settings /> Settings
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default IntegrationsList
