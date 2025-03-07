'use client'

import { Button } from '../ui/button'
import { Globe, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'

import { deleteDomainAction } from '@/actions/domain'
import { Card, CardContent } from '@/components/ui/card'
import { Domain } from '@/payload-types'

import DomainForm from './DomainForm'

const DomainList = ({ domains }: { domains: (string | Domain)[] }) => {
  const { execute, isPending } = useAction(deleteDomainAction)
  const { id, serviceId } = useParams<{ id: string; serviceId: string }>()

  const filteredDomains = domains.filter(domain => typeof domain !== 'string')

  return (
    <section className='space-y-6'>
      <DomainForm />

      <div className='space-y-4'>
        {filteredDomains.length ? (
          filteredDomains?.map(domainDetails => {
            if (typeof domainDetails === 'string') {
              return null
            }

            const { id: domainId, hostName } = domainDetails
            return (
              <Card key={domainId} className='text-sm'>
                <CardContent className='flex w-full items-center justify-between pt-4'>
                  <div className='flex items-center gap-3'>
                    <Globe size={20} className='text-green-600' />
                    <p className='font-semibold'>{hostName}</p>
                  </div>

                  <Button
                    size='icon'
                    onClick={() => {
                      execute({ id: domainId, projectId: id, serviceId })
                    }}
                    disabled={isPending}
                    variant='outline'>
                    <Trash2 />
                  </Button>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <p>No domains Found!</p>
        )}
      </div>
    </section>
  )
}

export default DomainList
