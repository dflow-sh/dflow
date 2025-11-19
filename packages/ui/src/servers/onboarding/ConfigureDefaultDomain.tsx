import { DomainFormWithoutDialog } from '../DomainForm'
import { env } from 'env'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { updateServerDomainAction } from '@/actions/server'
import Loader from '@/components/Loader'
import { WILD_CARD_DOMAINS } from '@/lib/constants'
import { ServerType } from '@/payload-types-overrides'

const ConfigureDefaultDomain = ({ server }: { server: ServerType }) => {
  const domains = server.domains ?? []
  const calledRef = useRef(false)
  const { execute, isPending, hasSucceeded, input } = useAction(
    updateServerDomainAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.info('Successfully added default domain', {
            description: `Please add necessary records and sync domain`,
            duration: 2500,
          })
        }
      },
      onError: ({ error, input }) => {
        toast.error(`Failed to ${input.operation} domain: ${error.serverError}`)
      },
    },
  )

  const wildcardDomains = [
    ...WILD_CARD_DOMAINS,
    env.NEXT_PUBLIC_PROXY_DOMAIN_URL ?? '',
  ]

  // create a domain with nip.io by default
  useEffect(() => {
    const domainAlreadyConfigured = domains?.some(({ domain }) =>
      wildcardDomains.some(wildcardDomain => domain.endsWith(wildcardDomain)),
    )

    if (!domainAlreadyConfigured && !hasSucceeded && !calledRef.current) {
      calledRef.current = true
      let domain: string | undefined = undefined

      // if proxy domain url is set, we need to add a domain with the proxy domain url
      // if tailscale is preferred and hostname is set, we need to add a domain with the hostname and proxy domain url
      // if publicIp is set, we need to add a domain with the publicIp and nip.io
      // if publicIp is not set, we need to add a domain with the publicIp and nip.io
      const publicIp = server.publicIp || server.ip

      if (env.NEXT_PUBLIC_PROXY_DOMAIN_URL) {
        if (server.preferConnectionType === 'tailscale' && server.hostname) {
          domain = `${server.hostname}.${env.NEXT_PUBLIC_PROXY_DOMAIN_URL}`
        } else if (publicIp) {
          domain = `${publicIp}.nip.io`
        }
      } else {
        if (publicIp) {
          domain = `${publicIp}.nip.io`
        }
      }

      if (!domain) {
        return
      }

      execute({
        id: server.id,
        domains: [domain],
        operation: 'set',
      })
    }
  }, [])

  if (isPending) {
    return (
      <div className='flex items-center gap-2'>
        <Loader className='h-min w-min' />

        <p>
          Configuring default domain <code>{input?.domains}</code>
        </p>
      </div>
    )
  }

  return <DomainFormWithoutDialog server={server} />
}

export default ConfigureDefaultDomain
