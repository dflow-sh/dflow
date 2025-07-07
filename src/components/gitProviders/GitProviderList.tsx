'use client'

import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { format } from 'date-fns'
import {
  ArrowDownToLine,
  Github,
  GithubIcon,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  const { execute, isPending } = useAction(deleteGitProviderAction, {
    onSuccess: () => {
      trigger()
    },
  })

  const installState = onboarding
    ? `gh_install:${provider.id}:onboarding`
    : `gh_install:${provider.id}`

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
              href={`${provider.github?.appUrl}/installations/new?state=${installState}`}>
              <Button variant={'outline'} size={'sm'}>
                <ArrowDownToLine />
                Install
              </Button>
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
  const [showAlert, setShowAlert] = useState<boolean>(false)

  useEffect(() => {
    if (
      searchParams.get('onboarding') === 'true' ||
      searchParams.get('action') === 'gh_init'
    ) {
      setShowAlert(true)
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
    <div className='mb-4 space-y-4'>
      {showAlert && (
        <Alert variant='warning'>
          <TriangleAlert className='h-4 w-4' />
          <AlertTitle>Github App created!</AlertTitle>
          <AlertDescription className='flex w-full flex-col justify-between gap-2 md:flex-row'>
            Make sure to install the app to deploy your app's.
          </AlertDescription>
        </Alert>
      )}
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
  ) : (
    <div className='my-8 flex w-full flex-col items-center justify-center gap-y-2'>
      <GithubIcon className='stroke-muted-foreground' size={32} />
      <p className='text-muted-foreground'>
        No git providers found. Please create a new one.
      </p>
    </div>
  )
}

export default GitProviderList
