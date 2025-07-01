'use client'

import SidebarToggleButton from '../SidebarToggleButton'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import {
  CircleCheckBig,
  CircleX,
  Globe,
  Info,
  Loader,
  Trash2,
} from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { WILD_CARD_DOMAINS } from '@/lib/constants'
import { Service } from '@/payload-types'

import DomainForm from './DomainForm'
import RegenerateSSLForm from './RegenerateSSLForm'

const getRecordName = (domain: string) => {
  const match = domain.match(
    /^((?:[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)?)\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/,
  )
  return match ? match[1] : '@'
}

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
      <CardContent className='flex w-full flex-col justify-between gap-4 pt-4 md:flex-row'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <Globe size={20} className='text-green-600' />

            <a
              href={`//${domain.domain}`}
              target='_blank'
              rel='noopener noreferrer'
              className='font-semibold hover:underline'>
              {domain.domain}
            </a>

            <Dialog>
              {!WILD_CARD_DOMAINS.some(wildcardDomain =>
                domain.domain.endsWith(wildcardDomain),
              ) && (
                <DialogTrigger asChild>
                  <Button size='icon' variant='ghost'>
                    <Info />
                  </Button>
                </DialogTrigger>
              )}

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Domain Configuration</DialogTitle>
                  <DialogDescription>
                    Add the records in your domain provider, This step can be
                    skipped for wildcard domains ex: nip.io, sslip.io
                  </DialogDescription>
                </DialogHeader>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[100px]'>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead className='text-right'>TTL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className='font-medium'>A</TableCell>
                      <TableCell>{getRecordName(domain.domain)}</TableCell>
                      <TableCell>{ip}</TableCell>
                      <TableCell className='text-right'>auto</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </DialogContent>
            </Dialog>
          </div>

          <StatusBadge />
        </div>

        <div className='flex items-center space-x-4 self-end md:self-center'>
          <Switch
            checked={domain.default ?? false}
            disabled
            title={domain.default ? 'Default Domain' : ''}
          />

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
                  default: domain.default,
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
          domains?.map(domainDetails => (
            <DomainCard
              key={domainDetails.domain}
              domain={domainDetails}
              ip={ip}
            />
          ))
        ) : (
          <div className='rounded-2xl border bg-muted/10 p-8 text-center shadow-sm'>
            <div className='grid min-h-[40vh] place-items-center'>
              <div>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
                  <Globe className='h-8 w-8 animate-pulse text-muted-foreground' />
                </div>

                <div className='my-4 space-y-1'>
                  <h3 className='text-xl font-semibold text-foreground'>
                    No Domains Added
                  </h3>
                  <p className='text-base text-muted-foreground'>
                    You haven’t added any domains to this server yet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default DomainList
