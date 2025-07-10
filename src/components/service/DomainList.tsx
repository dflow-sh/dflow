'use client'

import SidebarToggleButton from '../SidebarToggleButton'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { env } from 'env'
import {
  CircleCheckBig,
  CircleX,
  Globe,
  Info,
  Loader,
  RefreshCw,
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
import { Server, Service } from '@/payload-types'

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
  server,
  service,
  isProxyDomainExists,
}: {
  domain: NonNullable<Service['domains']>[number]
  ip: string
  server: Server | null
  service: Service
  isProxyDomainExists: boolean
}) => {
  const { serviceId } = useParams<{ id: string; serviceId: string }>()

  const { execute, isPending } = useAction(updateServiceDomainAction, {
    onSuccess: ({ data, input }) => {
      if (data?.success) {
        toast.info('Added to queue', {
          description: `Added ${input.operation === 'remove' ? 'removing' : 'setting'} domain to queue`,
        })
      }
    },
    onError: ({ error, input }) => {
      toast.error(`Failed to ${input.operation} domain: ${error.serverError}`)
    },
  })

  const {
    execute: checkDNSConfig,
    isPending: checkingDNSConfig,
    result,
  } = useAction(checkDNSConfigAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.info('Added to queue', {
          description: 'Added syncing domain to queue',
        })
      }
    },
    onError: ({ error, input }) => {
      toast.error(
        `Failed to verify ${input.domain} domain status: ${error.serverError}`,
      )
    },
  })

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
    onError: ({ error, input }) => {
      toast.error(`Failed to sync domain: ${error.serverError}`)
    },
  })

  const wildCardDomains = [
    ...WILD_CARD_DOMAINS,
    env.NEXT_PUBLIC_PROXY_DOMAIN_URL ?? '',
  ]

  const isWildCardDomain = wildCardDomains.some(wildCardDomain =>
    domain.domain.endsWith(wildCardDomain),
  )

  // Check if this is a default domain (proxy domain)
  const isDefaultDomain =
    env.NEXT_PUBLIC_PROXY_DOMAIN_URL &&
    server &&
    server.hostname &&
    domain.domain ===
      `${service.name}.${server.hostname}.${env.NEXT_PUBLIC_PROXY_DOMAIN_URL}`

  useEffect(() => {
    // Skip if wildcard domain or already synced
    if (isWildCardDomain || domain.synced || checkingDNSConfig) {
      return
    }

    // Check if we have actual result data
    const hasData = result?.data !== undefined
    const hasError = result?.serverError !== undefined
    const shouldCheck = !hasData && !hasError
    const shouldRetry = result?.serverError || result?.data === false

    if (shouldCheck) {
      // Check DNS config
      checkDNSConfig({
        ip,
        domain: domain.domain,
        proxyDomain: isProxyDomainExists
          ? env.NEXT_PUBLIC_PROXY_CNAME
          : undefined,
      })
    } else if (shouldRetry) {
      // Show failure badge for 30 seconds, then retry
      const timeoutId = setTimeout(() => {
        checkDNSConfig({
          ip,
          domain: domain.domain,
          proxyDomain: isProxyDomainExists
            ? env.NEXT_PUBLIC_PROXY_CNAME
            : undefined,
        })
      }, 30000)

      return () => clearTimeout(timeoutId)
    }
  }, [
    isWildCardDomain,
    domain.synced,
    domain.domain,
    checkingDNSConfig,
    result?.serverError,
    result?.data,
    ip,
    isProxyDomainExists,
  ])

  // Updated StatusBadge component to show states properly
  const StatusBadge = () => {
    // Show loading state while checking DNS
    if (checkingDNSConfig && !isWildCardDomain) {
      return (
        <Badge variant='info' className='gap-1 text-xs [&_svg]:size-3'>
          <Loader className='animate-spin' />
          Verifying
        </Badge>
      )
    }

    // Show success state
    if (result?.data === true || isWildCardDomain || domain.synced) {
      return (
        <Badge variant='success' className='gap-1 text-xs [&_svg]:size-3'>
          <CircleCheckBig />
          Valid Configuration
        </Badge>
      )
    }

    // Show failure state (will be visible for 30 seconds before retry)
    if (result?.serverError || result?.data === false) {
      return (
        <Badge variant='destructive' className='gap-1 text-xs [&_svg]:size-3'>
          <CircleX />
          Invalid Configuration
        </Badge>
      )
    }

    // Default state (no result yet)
    return (
      <Badge variant='secondary' className='gap-1 text-xs [&_svg]:size-3'>
        <Loader className='animate-spin' />
        Pending Verification
      </Badge>
    )
  }

  // Manual refresh function
  const handleRefresh = () => {
    checkDNSConfig({
      ip,
      domain: domain.domain,
      proxyDomain: isProxyDomainExists
        ? env.NEXT_PUBLIC_PROXY_CNAME
        : undefined,
    })
  }

  const disableDeleteButton = isDefaultDomain

  return (
    <Card
      className={`text-sm transition-all hover:bg-muted/20 hover:shadow-md`}>
      <CardContent className='pb-4 pt-6'>
        {/* Top section with domain info and actions */}
        <div className='mb-4 flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className={`rounded-full p-2 ${
                isDefaultDomain
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
              <Globe size={16} />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <a
                  href={`//${domain.domain}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-semibold hover:underline'>
                  {domain.domain}
                </a>
                {isDefaultDomain && (
                  <Badge variant='outline' className='text-xs'>
                    Default
                  </Badge>
                )}
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>
                {isDefaultDomain ? 'Automatically configured' : 'Custom domain'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {/* DNS Configuration Info */}
            <Dialog>
              {!wildCardDomains.some(wildcardDomain =>
                domain.domain.endsWith(wildcardDomain),
              ) && (
                <DialogTrigger asChild>
                  <Button size='sm' variant='ghost' className='h-8 w-8 p-0'>
                    <Info size={14} />
                  </Button>
                </DialogTrigger>
              )}

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Domain Configuration</DialogTitle>
                  <DialogDescription>
                    Add the records in your domain provider. This step can be
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
                    {isProxyDomainExists ? (
                      <TableRow>
                        <TableCell className='font-medium'>CNAME</TableCell>
                        <TableCell>{getRecordName(domain.domain)}</TableCell>
                        <TableCell>{env.NEXT_PUBLIC_PROXY_CNAME}</TableCell>
                        <TableCell className='text-right'>auto</TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell className='font-medium'>A</TableCell>
                        <TableCell>{getRecordName(domain.domain)}</TableCell>
                        <TableCell>{ip}</TableCell>
                        <TableCell className='text-right'>auto</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </DialogContent>
            </Dialog>

            {/* Refresh Button */}
            {!isWildCardDomain && (
              <Button
                size='sm'
                variant='ghost'
                className='h-8 w-8 p-0'
                onClick={handleRefresh}
                disabled={checkingDNSConfig}>
                <RefreshCw
                  size={14}
                  className={checkingDNSConfig ? 'animate-spin' : ''}
                />
              </Button>
            )}

            {/* Delete Button */}
            {!disableDeleteButton && (
              <Button
                size='sm'
                variant='ghost'
                className='h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive'
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
                disabled={isPending}>
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>

        {/* Bottom section with status and sync actions */}
        <div className='flex items-center justify-between border-t pt-3'>
          <StatusBadge />

          <Button
            size='sm'
            variant={domain.synced ? 'outline' : 'default'}
            className='h-8 px-3 text-xs'
            disabled={
              // Disable if verification hasn't succeeded yet (unless it's a wildcard domain or already synced)
              (!(result?.data === true || isWildCardDomain) &&
                !domain.synced) ||
              checkingDNSConfig ||
              syncingDomain ||
              domain.synced ||
              triggeredDomainSync ||
              isPending
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
            }}>
            {domain.synced
              ? 'Synced'
              : triggeredDomainSync
                ? 'Syncing...'
                : 'Sync Domain'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const DomainList = ({
  domains,
  ip,
  server,
  service,
}: {
  domains: NonNullable<Service['domains']>
  ip: string
  server: Server | null
  service: Service
}) => {
  const isProxyDomainExists =
    env.NEXT_PUBLIC_PROXY_DOMAIN_URL &&
    env.NEXT_PUBLIC_PROXY_CNAME &&
    server?.preferConnectionType === 'tailscale'

  return (
    <section className='space-y-6'>
      <div className='flex items-center gap-3'>
        <DomainForm ip={ip} />
        <RegenerateSSLForm />
        <SidebarToggleButton
          directory='servers'
          fileName='domains'
          sectionId='#-service-level-domains'
        />
      </div>

      <div className='space-y-3'>
        {domains.length ? (
          domains?.map(domainDetails => (
            <DomainCard
              key={domainDetails.domain}
              domain={domainDetails}
              ip={ip}
              server={server}
              service={service}
              isProxyDomainExists={Boolean(isProxyDomainExists)}
            />
          ))
        ) : (
          <div className='py-12 text-center text-muted-foreground'>
            <Globe size={48} className='mx-auto mb-4 opacity-50' />
            <p className='mb-2 text-lg font-medium'>No domains configured</p>
            <p className='text-sm'>Add a domain to get started</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default DomainList
