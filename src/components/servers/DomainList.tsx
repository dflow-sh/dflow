'use client'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  CircleCheckBig,
  CircleX,
  Globe,
  Info,
  Loader,
  Trash2,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { parseAsBoolean, useQueryState } from 'nuqs'
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
}: {
  domain: NonNullable<ServerType['domains']>[number]
  server: ServerType | Server
  showSync?: boolean // this prop is to hide sync button during server-onboarding time
}) => {
  const [, setDomainsVerified] = useQueryState(
    'domains-verified',
    parseAsBoolean.withDefault(false),
  )
  const allDomains = server.domains ?? []

  const { execute, isPending } = useAction(updateServerDomainAction, {
    onSuccess: ({ input, data }) => {
      if (data?.success) {
        toast.info('Added to queue', {
          description: `Added ${input.operation === 'set' ? 'setting' : 'removing'} domain ${input.domains.join(', ')} to queue`,
        })
      }
    },
  })

  const {
    execute: checkDNSConfig,
    isPending: checkingDNSConfig,
    result,
  } = useAction(checkDNSConfigAction, {
    onSuccess: ({ data: state }) => {
      // if it's server-onboarding that time updating query-params
      if (showSync) {
        setDomainsVerified(state ?? false)
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
  } = useAction(syncServerDomainAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.info('Added to queue', {
          description: 'Added syncing domain to queue',
        })
      }
    },
  })

  const isWildCardDomain = WILD_CARD_DOMAINS.some(wildCardDomain =>
    domain.domain.endsWith(wildCardDomain),
  )

  useEffect(() => {
    if (!isWildCardDomain) {
      checkDNSConfig({ ip: server.ip, domain: `*.${domain.domain}` })
    }

    // if it's server-onboarding that time updating query-params
    if (isWildCardDomain && showSync) {
      setDomainsVerified(true)
    }
  }, [])

  useEffect(() => {
    if (result?.serverError && !checkingDNSConfig) {
      setTimeout(() => {
        checkDNSConfig({ ip: server.ip, domain: `*.${domain.domain}` })
      }, 3000)
    }
  }, [result?.serverError, checkingDNSConfig])

  const StatusBadge = () => {
    if (checkingDNSConfig && !isWildCardDomain) {
      return (
        <Badge variant='info' className='gap-1 [&_svg]:size-4'>
          <Loader className='animate-spin' />
          Verifying DNS
        </Badge>
      )
    }

    if (result?.data || isWildCardDomain) {
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
    <>
      <Card className='text-sm'>
        <CardContent className='flex w-full flex-col gap-6 pt-4 sm:flex-row sm:justify-between'>
          <div className='flex items-center gap-3'>
            <Globe size={20} className='text-green-600' />
            <p className='font-semibold'>{domain.domain}</p>

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
                      <TableCell>{`*.${extractWildcard(domain.domain)}`}</TableCell>
                      <TableCell>{server.ip}</TableCell>
                      <TableCell className='text-right'>auto</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </DialogContent>
            </Dialog>
          </div>

          <div className='flex items-center gap-4 self-end'>
            <StatusBadge />

            {showSync && (
              <Button
                variant='outline'
                disabled={
                  !!result?.serverError ||
                  checkingDNSConfig ||
                  syncingDomain ||
                  domain.synced ||
                  triggeredDomainSync ||
                  isPending
                }
                isLoading={syncingDomain}
                onClick={() => {
                  // for first domain removing all the server pre-configured hostnames with set operation
                  syncDomain({
                    domains: [domain.domain],
                    id: server.id,
                    operation: allDomains.length === 1 ? 'set' : 'add',
                  })
                }}>
                {domain.synced
                  ? 'Synced Domain'
                  : triggeredDomainSync
                    ? 'Syncing Domain'
                    : 'Sync Domain'}
              </Button>
            )}

            <Button
              size='icon'
              onClick={() => {
                execute({
                  operation: 'remove',
                  domains: [domain.domain],
                  id: server.id,
                })
              }}
              disabled={isPending}
              variant='outline'>
              <Trash2 />
            </Button>
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

  return (
    <div className='space-y-4'>
      {addedDomains.length ? (
        <div className='space-y-4'>
          {addedDomains.map(domain => (
            <DomainItem
              key={domain.id}
              domain={domain}
              server={server}
              showSync={showSync}
            />
          ))}
        </div>
      ) : (
        <p>No Domains Found!</p>
      )}
    </div>
  )
}

export default DomainList
