'use client'

import SidebarToggleButton from '../SidebarToggleButton'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { CircleCheckBig, CircleX, Globe, Loader, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { checkDNSConfigAction } from '@/actions/server'
import {
  syncServiceDomainAction,
  updateServiceDomainAction,
} from '@/actions/service'
import { Card, CardContent } from '@/components/ui/card'
import { Service } from '@/payload-types'

import DomainForm from './DomainForm'
import RegenerateSSLForm from './RegenerateSSLForm'

const DomainCard = ({
  domain,
  ip,
}: {
  domain: NonNullable<Service['domains']>[number]
  ip: string
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

  const {
    execute: checkDNSConfig,
    isPending: checkingDNSConfig,
    result,
  } = useAction(checkDNSConfigAction)

  const {
    execute: syncDomain,
    isPending: syncingDomain,
    hasSucceeded: triggeredDomainSync,
  } = useAction(syncServiceDomainAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.info('Added to queue', {
          description: 'Added syncing domain to queue',
        })
      }
    },
  })

  useEffect(() => {
    checkDNSConfig({ ip, domain: domain.domain })
  }, [])

  const StatusBadge = () => {
    if (checkingDNSConfig) {
      return (
        <Badge variant='info' className='gap-1 [&_svg]:size-4'>
          <Loader className='animate-spin' />
          Verifying DNS
        </Badge>
      )
    }

    if (result?.data) {
      return (
        <Badge variant='success' className='gap-1 [&_svg]:size-4'>
          <CircleCheckBig />
          Verification Success
        </Badge>
      )
    }

    if (result?.serverError) {
      return (
        <Badge variant='destructive' className='gap-1 [&_svg]:size-4'>
          <CircleX />
          Verification Failed
        </Badge>
      )
    }
  }

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
          </a>
        </div>

        <div className='flex items-center space-x-4'>
          <Switch
            checked={domain.default ?? false}
            disabled
            title={domain.default ? 'Default Domain' : ''}
          />

          <StatusBadge />

          <Button
            disabled={
              !!result?.serverError ||
              checkingDNSConfig ||
              syncingDomain ||
              domain.synced ||
              triggeredDomainSync
            }
            isLoading={syncingDomain}
            onClick={() => {
              syncDomain({
                domain: {
                  hostname: domain.domain,
                  autoRegenerateSSL: domain.autoRegenerateSSL ?? false,
                  certificateType: domain.certificateType ?? 'letsencrypt',
                  default: domain.default ?? false,
                },
                id: serviceId,
                operation: 'add',
              })
            }}
            variant='outline'>
            {domain.synced
              ? 'Synced Domain'
              : triggeredDomainSync
                ? 'Syncing Domain'
                : 'Sync Domain'}
          </Button>

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
  ip,
}: {
  domains: NonNullable<Service['domains']>
  ip: string
}) => {
  return (
    <section className='space-y-6'>
      <div className='flex items-center gap-3'>
        <DomainForm />
        <RegenerateSSLForm />
        <SidebarToggleButton
          directory='servers'
          fileName='domains'
          sectionId='#-service-level-domains'
        />
      </div>

      <div className='space-y-4'>
        {domains.length ? (
          domains?.map(domainDetails => {
            return (
              <DomainCard
                key={domainDetails.domain}
                domain={domainDetails}
                ip={ip}
              />
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
