'use client'

import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { AlertTriangle, Check, FolderOpen, RotateCcw } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { toast } from 'sonner'

import { configureGlobalBuildDirAction } from '@/actions/server'
import { Server } from '@/payload-types'

const GlobalBuildDirForm = ({ server }: { server: Server }) => {
  const [buildDir, setBuildDir] = useState(server.globalBuildPath || '')

  const isServerConnected = server.connection?.status === 'success'

  const { execute, isPending } = useAction(configureGlobalBuildDirAction, {
    onSuccess: result => {
      if (result?.data?.success) {
        toast.success('Global build path updated!')
      } else {
        toast.error('Failed to update build path', {
          description: result?.data?.message,
        })
      }
    },
    onError: error => {
      toast.error('Failed to update build path', {
        description: error?.error?.serverError,
      })
    },
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    execute({ serverId: server.id, buildDir })
  }

  const handleReset = () => {
    setBuildDir('/')
    execute({ serverId: server.id, buildDir: '/' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove leading slash if present
    const value = e.target.value.replace(/^\/+/, '')
    setBuildDir(value)
  }

  const displayValue = buildDir || '/'
  const isDefaultPath = !buildDir

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <FolderOpen className='h-5 w-5' />
          <CardTitle>Global Build Directory</CardTitle>
          {!isDefaultPath && buildDir !== '/' && (
            <Badge variant='secondary' className='ml-auto'>
              Custom Path
            </Badge>
          )}
        </div>
        <CardDescription>
          Set the global default build directory for all Dokku applications on
          this server. Individual apps can override this with app-specific
          settings.
          {!isServerConnected && (
            <span className='mt-1 block text-destructive'>
              You cannot update the global build path while the server is
              disconnected.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {buildDir && buildDir !== '/' && (
          <Alert variant='warning'>
            <AlertTriangle className='h-4 w-4' />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Setting a custom build directory will result in loss of any
              changes to the top-level directory, such as the{' '}
              <code className='rounded bg-muted px-1'>git.keep-git-dir</code>{' '}
              property. Make sure this is the intended behavior for your
              deployment.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSave} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='buildDir' className='flex items-center gap-2'>
              Global Build Directory
              <span className='text-xs text-muted-foreground'>
                (current:{' '}
                <code className='rounded bg-muted px-1 text-xs'>
                  {displayValue}
                </code>
                )
              </span>
            </Label>
            <div className='relative'>
              <Input
                id='buildDir'
                value={buildDir}
                onChange={handleInputChange}
                placeholder='e.g. app2, dist, build, apps/backend (leave empty for repository root)'
                disabled={isPending || !isServerConnected}
              />
              {isDefaultPath && (
                <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                  <Check className='h-4 w-4 text-green-500' />
                </div>
              )}
            </div>
            {!isServerConnected && (
              <div className='mt-1 text-xs text-muted-foreground'>
                You can only update the global build path when the server is
                connected.
              </div>
            )}
          </div>

          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleReset}
              disabled={
                isPending ||
                !isServerConnected ||
                (!buildDir && !server.globalBuildPath) ||
                (buildDir === '/' &&
                  (!server.globalBuildPath || server.globalBuildPath === '/'))
              }>
              <RotateCcw className='mr-2 h-4 w-4' />
              Reset to Default
            </Button>
            <Button
              type='submit'
              disabled={
                isPending ||
                !isServerConnected ||
                buildDir === (server.globalBuildPath || '')
              }>
              {isPending ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </form>

        <Separator />

        <div className='space-y-3 text-sm'>
          <h4 className='font-medium'>How It Works</h4>
          <div className='space-y-2 text-muted-foreground'>
            <div className='flex items-start gap-2'>
              <code className='min-w-fit rounded bg-muted px-2 py-1 font-mono text-xs'>
                (empty)
              </code>
              <span>
                Uses the entire repository as the build context. This is the
                default behavior and preserves all top-level repository
                properties.
              </span>
            </div>
            <div className='flex items-start gap-2'>
              <code className='min-w-fit rounded bg-muted px-2 py-1 font-mono text-xs'>
                app2
              </code>
              <span>
                Uses only the app2 subdirectory as the build context. Useful
                when your application code is in a specific folder within a
                monorepo.
              </span>
            </div>
            <div className='flex items-start gap-2'>
              <code className='min-w-fit rounded bg-muted px-2 py-1 font-mono text-xs'>
                apps/backend
              </code>
              <span>
                Uses the apps/backend subdirectory for monorepo setups where
                different applications are in separate nested folders.
              </span>
            </div>
            <div className='flex items-start gap-2'>
              <code className='min-w-fit rounded bg-muted px-2 py-1 font-mono text-xs'>
                dist
              </code>
              <span>
                Uses the dist folder, typically for applications that have a
                build step that outputs to a dist directory.
              </span>
            </div>
          </div>
          <div className='mt-4 rounded-lg bg-muted/50 p-3'>
            <p className='text-xs text-muted-foreground'>
              <strong>Important:</strong> Setting a custom build directory will
              result in loss of any changes to the top-level directory, such as
              the{' '}
              <code className='rounded bg-muted px-1'>git.keep-git-dir</code>{' '}
              property. This global setting applies to all apps on this server
              unless overridden by app-specific configuration. If the specified
              directory doesn't exist in the repository, the build will fail.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default GlobalBuildDirForm
