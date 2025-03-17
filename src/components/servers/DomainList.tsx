'use client'

import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { Globe, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

import { updateServerDomainAction } from '@/actions/server'
import { Card, CardContent } from '@/components/ui/card'
import { ServerType } from '@/payload-types-overrides'

import DomainForm from './DomainForm'

const DomainItem = ({
  domain,
  server,
}: {
  domain: NonNullable<ServerType['domains']>[number]
  server: ServerType
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

  return (
    <Card className='max-w-5xl text-sm'>
      <CardContent className='flex w-full items-center justify-between pt-4'>
        <div className='flex items-center gap-3'>
          <Globe size={20} className='text-green-600' />
          <p className='font-semibold'>{domain.domain}</p>
        </div>

        <div className='space-x-4'>
          <Switch
            defaultChecked={domain.default}
            disabled={domain.default}
            onCheckedChange={checked => {
              if (checked) {
                execute({
                  operation: 'set',
                  domain: domain.domain,
                  id: server.id,
                })
              }
            }}
          />

          <Button
            size='icon'
            onClick={() => {
              execute({
                operation: 'remove',
                domain: domain.domain,
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
  )
}

const DomainList = ({ server }: { server: ServerType }) => {
  const addedDomains = server.domains ?? []

  return (
    <div className='space-y-4'>
      <DomainForm server={server} />

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
