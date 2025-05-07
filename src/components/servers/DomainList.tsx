'use client'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  CircleCheckBig,
  CircleX,
  Globe,
  Info,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect } from 'react'
import { toast } from 'sonner'

import {
  checkDNSConfigAction,
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
import { isDemoEnvironment } from '@/lib/constants'
import { Server } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

import DomainForm from './DomainForm'

const extractWildcard = (domain: string) => {
  const match = domain.match(/^([\d\.]+|[^.]+)\./)
  return match ? match[1] : null
}

const DomainItem = ({
  domain,
  server,
}: {
  domain: NonNullable<ServerType['domains']>[number]
  server: ServerType | Server
}) => {
  const { execute, isPending } = useAction(updateServerDomainAction, {
    onSuccess: ({ input, data }) => {
      if (data?.success) {
        toast.info('Added to queue', {
          description: `Added ${input.operation === 'set' ? 'setting' : 'removing'} domain ${input.domain} to queue`,
        })
      }
    },
  })

  const {
    execute: checkDNSConfig,
    isPending: checkingDNSConfig,
    result,
  } = useAction(checkDNSConfigAction)

  useEffect(() => {
    checkDNSConfig({ ip: server.ip, domain: `*.${domain.domain}` })
  }, [])

  const StatusBadge = () => {
    if (checkingDNSConfig) {
      return null
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
    <>
      <Card className='text-sm'>
        <CardContent className='flex w-full flex-col gap-6 pt-4 sm:flex-row sm:justify-between'>
          <div className='flex items-center gap-3'>
            <Globe size={20} className='text-green-600' />
            <p className='font-semibold'>{domain.domain}</p>

            <Dialog>
              <DialogTrigger asChild>
                <Button size='icon' variant='ghost'>
                  <Info />
                </Button>
              </DialogTrigger>

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
            {/* <Switch
              defaultChecked={domain.default}
              disabled={domain.default || isDemoEnvironment}
              onCheckedChange={checked => {
                if (checked) {
                  execute({
                    operation: 'set',
                    domain: domain.domain,
                    id: server.id,
                  })
                }
              }}
            /> */}
            <StatusBadge />

            <Button
              variant='outline'
              disabled={checkingDNSConfig}
              onClick={() => {
                checkDNSConfig({ ip: server.ip, domain: `*.${domain.domain}` })
              }}>
              <RefreshCw
                className={`${checkingDNSConfig ? 'animate-spin delay-200' : ''}`}
              />
              {checkingDNSConfig ? 'Refreshing Status...' : 'Refresh Status'}
            </Button>

            <Button
              size='icon'
              onClick={() => {
                execute({
                  operation: 'remove',
                  domain: domain.domain,
                  id: server.id,
                })
              }}
              disabled={isPending || isDemoEnvironment}
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
  showForm = true,
}: {
  server: ServerType | Server
  showForm?: boolean
}) => {
  const addedDomains = server.domains ?? []

  return (
    <div className='space-y-4'>
      {showForm && <DomainForm server={server} />}

      {addedDomains.length ? (
        <div className='space-y-4'>
          {addedDomains.map(domain => (
            <DomainItem key={domain.domain} domain={domain} server={server} />
          ))}
        </div>
      ) : (
        <p>No Domains Found!</p>
      )}
    </div>
  )
}

export default DomainList
