'use client'

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
import { useEffect } from 'react'
import { toast } from 'sonner'

import {
  checkDNSConfigAction,
  syncServerDomainAction,
  updateServerDomainAction,
} from '@/actions/server'
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
import { Server } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

const extractWildcard = (domain: string) => {
  const match = domain.match(/^([\d\.]+|[^.]+)\./)
  return match ? match[1] : null
}

const DomainItem = ({
  domain,
  server,
  showSync = true,
  isProxyDomainExists,
}: {
  domain: NonNullable<ServerType['domains']>[number]
  server: ServerType | Server
  showSync?: boolean
  isProxyDomainExists: boolean
}) => {
  const allDomains = server.domains ?? []

  const { execute, isPending } = useAction(updateServerDomainAction, {
    onSuccess: ({ input, data }) => {
      if (data?.success) {
        toast.info('Added to queue', {
          description: `Added ${input.operation === 'set' ? 'setting' : 'removing'} domain ${input.domains.join(', ')} to queue`,
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
      // if (data) {
      // toast.info('Added to queue', {
      //   description: 'Added syncing domain to queue',
      // })
      // }
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
  } = useAction(syncServerDomainAction, {
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

  // Check if this is a default domain (proxy domain with tailscale)
  const isDefaultDomain =
    env.NEXT_PUBLIC_PROXY_DOMAIN_URL &&
    server.preferConnectionType === 'tailscale' &&
    server.hostname &&
    domain.domain === `${server.hostname}.${env.NEXT_PUBLIC_PROXY_DOMAIN_URL}`

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
        ip:
          server.preferConnectionType === 'tailscale'
            ? (server.publicIp ?? '')
            : (server.ip ?? ''),
        domain: `*.${domain.domain}`,
        proxyDomain: isProxyDomainExists
          ? env.NEXT_PUBLIC_PROXY_CNAME
          : undefined,
      })
    } else if (shouldRetry) {
      // Show failure badge for 30 seconds, then retry
      const timeoutId = setTimeout(() => {
        checkDNSConfig({
          ip:
            server.preferConnectionType === 'tailscale'
              ? (server.publicIp ?? '')
              : (server.ip ?? ''),
          domain: `*.${domain.domain}`,
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
    server.ip ?? server.publicIp,
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
      ip:
        server.preferConnectionType === 'tailscale'
          ? (server.publicIp ?? '')
          : (server.ip ?? ''),
      domain: `*.${domain.domain}`,
      proxyDomain: isProxyDomainExists
        ? env.NEXT_PUBLIC_PROXY_CNAME
        : undefined,
    })
  }

  // if proxy domain url is set, and tailscale is preferred, and hostname is set, and domain is the proxy domain url, then disable delete button
  const disableDeleteButton = isDefaultDomain

  return (
    <>
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
                  {isDefaultDomain
                    ? 'Automatically configured'
                    : 'Custom domain'}
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
                          <TableCell>{`*.${extractWildcard(domain.domain)}`}</TableCell>
                          <TableCell>{env.NEXT_PUBLIC_PROXY_CNAME}</TableCell>
                          <TableCell className='text-right'>auto</TableCell>
                        </TableRow>
                      ) : (
                        <TableRow>
                          <TableCell className='font-medium'>A</TableCell>
                          <TableCell>{`*.${extractWildcard(domain.domain)}`}</TableCell>
                          <TableCell>{server.ip ?? server.publicIp}</TableCell>
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
                      domains: [domain.domain],
                      id: server.id,
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

            {showSync && (
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
                    domains: [domain.domain],
                    id: server.id,
                    operation: allDomains.length === 1 ? 'set' : 'add',
                  })
                }}>
                {domain.synced
                  ? 'Synced'
                  : triggeredDomainSync
                    ? 'Syncing...'
                    : 'Sync Domain'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

const DomainList = ({
  server,
  showSync = true,
}: {
  server: ServerType | Server
  showSync?: boolean
}) => {
  const addedDomains = server.domains ?? []

  // check if proxy domain is added
  const isProxyDomainExists =
    env.NEXT_PUBLIC_PROXY_DOMAIN_URL &&
    env.NEXT_PUBLIC_PROXY_CNAME &&
    server.preferConnectionType === 'tailscale'

  return (
    <div className='space-y-3'>
      {addedDomains.length ? (
        <div className='space-y-3'>
          {addedDomains.map(domain => (
            <DomainItem
              key={domain.id}
              domain={domain}
              server={server}
              showSync={showSync}
              isProxyDomainExists={Boolean(isProxyDomainExists)}
            />
          ))}
        </div>
      ) : (
        <div className='py-12 text-center text-muted-foreground'>
          <Globe size={48} className='mx-auto mb-4 opacity-50' />
          <p className='mb-2 text-lg font-medium'>No domains configured</p>
          <p className='text-sm'>Add a domain to get started</p>
        </div>
      )}
    </div>
  )
}

export default DomainList
