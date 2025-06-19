import { DomainFormWithoutDialog } from '../DomainForm'
import { useAction } from 'next-safe-action/hooks'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { updateServerDomainAction } from '@/actions/server'
import { WILD_CARD_DOMAINS } from '@/lib/constants'
import { ServerType } from '@/payload-types-overrides'

const ConfigureDefaultDomain = ({ server }: { server: ServerType }) => {
  const domains = server.domains ?? []

  const { execute, isPending } = useAction(updateServerDomainAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.info('Successfully added default domain', {
          description: `Please add necessary records and sync domain`,
          duration: 2500,
        })
      }
    },
  })

  // todo: create a domain with nip.io by default
  useEffect(() => {
    const domainAlreadyConfigured = domains?.some(({ domain }) =>
      WILD_CARD_DOMAINS.some(wildcardDomain => domain.endsWith(wildcardDomain)),
    )

    if (!domainAlreadyConfigured) {
      execute({
        id: server.id,
        domains: [`${server.ip}.nip.io`],
        operation: 'add',
      })
    }
  }, [])

  if (isPending) {
    return <p>Configuring default domain...</p>
  }

  return <DomainFormWithoutDialog server={server} />
}

export default ConfigureDefaultDomain
