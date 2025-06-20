import { DomainFormWithoutDialog } from '../DomainForm'
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
  const { execute, isPending, hasSucceeded } = useAction(
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

  // create a domain with nip.io by default
  useEffect(() => {
    const domainAlreadyConfigured = domains?.some(({ domain }) =>
      WILD_CARD_DOMAINS.some(wildcardDomain => domain.endsWith(wildcardDomain)),
    )

    if (!domainAlreadyConfigured && !hasSucceeded && !calledRef.current) {
      calledRef.current = true
      execute({
        id: server.id,
        domains: [`${server.ip}.nip.io`],
        operation: 'add',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isPending) {
    return (
      <div className='flex items-center gap-2'>
        <Loader className='h-min w-min' />
        <p>
          Configuring default domain <code>({`${server.ip}.nip.io`})</code>
        </p>
      </div>
    )
  }

  return <DomainFormWithoutDialog server={server} />
}

export default ConfigureDefaultDomain
