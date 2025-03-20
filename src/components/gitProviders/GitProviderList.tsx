'use client'

import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { format } from 'date-fns'
import { Download, Github, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'

import { deleteGitProviderAction } from '@/actions/gitProviders'
import { GitProvider } from '@/payload-types'

const GithubCard = ({ provider }: { provider: GitProvider }) => {
  const { execute, isPending } = useAction(deleteGitProviderAction)

  return (
    <Card key={provider.id} className='max-w-5xl'>
      <CardContent className='flex w-full items-center justify-between gap-3 pt-4'>
        <div className='flex items-center gap-3'>
          <Github size={20} />

          <div>
            <p className='font-semibold'>{provider?.github?.appName}</p>
            <time className='text-sm text-muted-foreground'>
              {format(new Date(provider.createdAt), 'LLL d, yyyy h:mm a')}
            </time>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          {!provider?.github?.installationId && (
            <Link
              href={`${provider.github?.appUrl}/installations/new?state=gh_install:${provider.id}&onboarding=true`}>
              <Download size={20} />
            </Link>
          )}

          <Button
            disabled={isPending}
            onClick={() => {
              execute({ id: provider.id })
            }}
            size='icon'
            variant='outline'>
            <Trash2 size={20} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const GitProviderList = ({ gitProviders }: { gitProviders: GitProvider[] }) => {
  return gitProviders.length ? (
    <div className='mt-4 space-y-4'>
      {gitProviders.map(provider => {
        if (provider.type === 'github') {
          return <GithubCard provider={provider} key={provider.id} />
        }

        return null
      })}
    </div>
  ) : null
}

export default GitProviderList
