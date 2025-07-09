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

      // not adding a default domain in these conditions
      // 1. preferConnectionType is tailscale
      // 2. user has no publicIp assigned or publicIp === 999.999.999.999
      // if (
      //   server.preferConnectionType === 'tailscale' &&
      //   (!server.publicIp ||
      //     (server.publicIp && server.publicIp === '999.999.999.999'))
      // ) {
      //   return
      // }

      let domain: string | undefined = undefined

      // if proxy domain url is set, we need to add a domain with the proxy domain url
      // if tailscale is preferred and hostname is set, we need to add a domain with the hostname and proxy domain url
      // if publicIp is set, we need to add a domain with the publicIp and nip.io
      // if publicIp is not set, we need to add a domain with the publicIp and nip.io
      if (env.NEXT_PUBLIC_PROXY_DOMAIN_URL) {
        if (server.preferConnectionType === 'tailscale' && server.hostname) {
          domain = `${server.hostname}.${env.NEXT_PUBLIC_PROXY_DOMAIN_URL}`
        } else if (server.publicIp) {
          domain = `${server.publicIp}.nip.io`
        }
      } else {
        if (server.publicIp) {
          domain = `${server.publicIp}.nip.io`
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isPending) {
    const ip =
      server.preferConnectionType === 'ssh' ? server.ip : server.publicIp

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
