'use client'

import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { ArrowUpRight, Globe, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

import { updateServiceDomainAction } from '@/actions/service'
import { Card, CardContent } from '@/components/ui/card'
import { Service } from '@/payload-types'

import DomainForm from './DomainForm'

const DomainCard = ({
  domain,
}: {
  domain: NonNullable<Service['domains']>[number]
}) => {
  const { serviceId } = useParams<{ id: string; serviceId: string }>()

  const { execute, isPending } = useAction(updateServiceDomainAction, {
    onSuccess: ({ data, input }) => {
      if (data?.success) {
        toast.info('Added to queue', {
          description: `Added domain ${input.operation === 'remove' ? 'removing' : 'setting'} to queue`,
        })
      }
    },
    onError: ({ error, input }) => {
      toast.error(`Failed to ${input.operation}  domain: ${error.serverError}`)
    },
  })

  return (
    <Card className='text-sm'>
      <CardContent className='flex w-full items-center justify-between pt-4'>
        <div className='flex items-center gap-3'>
          <Globe size={20} className='text-green-600' />
          <a
            href={`//${domain.domain}`}
            target='_blank'
            className='font-semibold hover:underline'>
            {domain.domain}
            <ArrowUpRight className='ml-1 inline-block' size={16} />
          </a>
        </div>

        <div className='space-x-4'>
          <Switch
            defaultChecked={domain.default}
            disabled={domain.default}
            onCheckedChange={checked => {
              if (checked) {
                execute({
                  operation: 'set',
                  domain: {
                    hostname: domain.domain,
                    autoRegenerateSSL: domain.autoRegenerateSSL ?? false,
                    certificateType: domain.certificateType ?? 'none',
                  },
                  id: serviceId,
                })
              }
            }}
          />

          <Button
            size='icon'
            onClick={() => {
              execute({
                operation: 'remove',
                domain: {
                  hostname: domain.domain,
                  autoRegenerateSSL: domain.autoRegenerateSSL ?? false,
                  certificateType: domain.certificateType ?? 'none',
                },
                id: serviceId,
              })
            }}
            disabled={isPending}
            variant='outline'>
            <Trash2 />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const DomainList = ({
  domains,
}: {
  domains: NonNullable<Service['domains']>
}) => {
  return (
    <section className='space-y-6'>
      <DomainForm />

      <div className='space-y-4'>
        {domains.length ? (
          domains?.map(domainDetails => {
            return (
              <DomainCard key={domainDetails.domain} domain={domainDetails} />
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
