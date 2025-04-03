'use client'

import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { format } from 'date-fns'
import { env } from 'env'
import { Download, Github, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { deleteGitProviderAction } from '@/actions/gitProviders'
import { GitProvider } from '@/payload-types'

const GithubCard = ({
  provider,
  onboarding = false,
  trigger = () => {},
}: {
  provider: GitProvider
  onboarding?: boolean
  trigger?: () => void
}) => {
  const isDemo = env.NEXT_PUBLIC_ENVIRONMENT === 'DEMO'
  const { execute, isPending } = useAction(deleteGitProviderAction, {
    onSuccess: () => {
      trigger()
    },
  })

  return (
    <Card key={provider.id}>
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
              href={`${provider.github?.appUrl}/installations/new?state=gh_install:${provider.id}:${onboarding && 'onboarding'}`}>
              <Download size={20} />
            </Link>
          )}

          <Button
            disabled={isPending || isDemo}
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

const GitProviderList = ({
  gitProviders,
  onboarding = false,
  trigger = () => {},
}: {
  gitProviders: GitProvider[]
  onboarding?: boolean
  trigger?: () => void
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.get('action') === 'gh_init') {
      toast.success('Successfully created github app', {
        duration: 10000,
        description: `Please install the github app to deploy your app's.`,
      })

      const params = new URLSearchParams(searchParams.toString())
      params.delete('action')

      router.replace(`?${params.toString()}`, { scroll: false })
    } else if (searchParams.get('action') === 'gh_install') {
      toast.success('Successfully installed github app', {
        duration: 10000,
        description: `Github app has been installed successfully.`,
      })

      const params = new URLSearchParams(searchParams.toString())
      params.delete('action')

      router.replace(`?${params.toString()}`, { scroll: false })
    }
  }, [searchParams, router])

  return gitProviders.length ? (
    <div className='mt-4 space-y-4'>
      {gitProviders.map(provider => {
        if (provider.type === 'github') {
          return (
            <GithubCard
              provider={provider}
              key={provider.id}
              onboarding={onboarding}
              trigger={trigger}
            />
          )
        }

        return null
      })}
    </div>
  ) : null
}

export default GitProviderList
