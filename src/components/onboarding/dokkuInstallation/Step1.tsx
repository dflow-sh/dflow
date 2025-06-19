import { CheckCircle, HardDrive, Play, TriangleAlert, Wifi } from 'lucide-react'

import { Dokku, Linux, Ubuntu } from '@/components/icons'
import { useDokkuInstallationStep } from '@/components/onboarding/dokkuInstallation/DokkuInstallationStepContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { supportedLinuxVersions } from '@/lib/constants'
import { ServerType } from '@/payload-types-overrides'

const serverTypeIcons: { [key: string]: React.ComponentType<any> } = {
  Ubuntu: Ubuntu,
  Linux: Linux,
}

const Step1 = ({ server }: { server: ServerType }) => {
  const { sshConnected, os, name, provider, version } = server
  const { setDokkuInstallationStep, dokkuInstallationStep } =
    useDokkuInstallationStep()

  const isSSHConnected = sshConnected
  const supportedOS = supportedLinuxVersions.includes(os.version ?? '')
  const ServerTypeIcon = serverTypeIcons[os.type ?? ''] ?? Linux
  const isDokkuInstalled = version && version !== 'not-installed'
  const isServerReady = isSSHConnected && supportedOS

  const getProviderDisplay = () => {
    switch (provider) {
      case 'aws':
        return 'AWS EC2'
      case 'other':
        return 'Custom Server'
      default:
        return provider?.toUpperCase() || 'Unknown'
    }
  }

  const getReadinessStatus = () => {
    if (!isSSHConnected)
      return { status: 'error', message: 'SSH Connection Failed' }
    if (!supportedOS)
      return { status: 'error', message: 'Unsupported OS Version' }
    if (isDokkuInstalled)
      return { status: 'success', message: 'Dokku Already Installed' }
    return { status: 'ready', message: 'Ready for Installation' }
  }

  const getButtonText = () => {
    if (isDokkuInstalled) return 'Continue with Other Process'
    return 'Start Installation'
  }

  const getButtonDescription = () => {
    if (isDokkuInstalled) return 'Proceed to configure plugins and settings'
    return 'Begin Dokku installation process'
  }

  const handleStartProcess = () => {
    setDokkuInstallationStep(2)
  }

  const readiness = getReadinessStatus()

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <HardDrive size={20} />
          Server Information
        </CardTitle>
        <CardDescription>
          Review the server details and configuration before proceeding with
          Dokku installation.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Server Basic Info */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              Server Name
            </label>
            <p className='text-sm font-semibold'>{name}</p>
          </div>
          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              Provider
            </label>
            <p className='text-sm font-semibold'>{getProviderDisplay()}</p>
          </div>
        </div>

        {/* OS Information */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-muted-foreground'>
            Operating System
          </label>
          <div className='flex items-center gap-2'>
            <ServerTypeIcon fontSize={16} />
            <span className='text-sm font-semibold'>
              {os.type} {os.version}
            </span>
            {supportedOS ? (
              <Badge variant='secondary' className='text-xs'>
                <CheckCircle size={12} className='mr-1' />
                Supported
              </Badge>
            ) : (
              <Badge variant='destructive' className='text-xs'>
                <TriangleAlert size={12} className='mr-1' />
                Not Supported
              </Badge>
            )}
          </div>
        </div>

        {/* Connection Status */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-muted-foreground'>
            SSH Connection
          </label>
          <div className='flex items-center gap-2'>
            <Wifi size={16} />
            <span className='text-sm font-semibold'>
              {isSSHConnected ? 'Connected' : 'Disconnected'}
            </span>
            <Badge
              variant={isSSHConnected ? 'secondary' : 'destructive'}
              className='text-xs'>
              {isSSHConnected ? (
                <>
                  <CheckCircle size={12} className='mr-1' />
                  Active
                </>
              ) : (
                <>
                  <TriangleAlert size={12} className='mr-1' />
                  Failed
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Dokku Status */}
        {isDokkuInstalled && (
          <div className='space-y-2'>
            <label className='text-sm font-medium text-muted-foreground'>
              Dokku Status
            </label>
            <div className='flex items-center gap-2'>
              <Dokku height={16} width={16} />
              <span className='text-sm font-semibold'>Version {version}</span>
              <Badge variant='secondary' className='text-xs'>
                <CheckCircle size={12} className='mr-1' />
                Installed
              </Badge>
            </div>
          </div>
        )}

        {/* Readiness Status */}
        <div className='mt-6 rounded-lg bg-muted/50 p-3'>
          <div className='flex items-center gap-2'>
            {readiness.status === 'success' && (
              <CheckCircle size={16} className='text-green-600' />
            )}
            {readiness.status === 'ready' && (
              <CheckCircle size={16} className='text-blue-600' />
            )}
            {readiness.status === 'error' && (
              <TriangleAlert size={16} className='text-red-600' />
            )}
            <span
              className={`text-sm font-medium ${
                readiness.status === 'success'
                  ? 'text-green-600'
                  : readiness.status === 'ready'
                    ? 'text-blue-600'
                    : 'text-red-600'
              }`}>
              {readiness.message}
            </span>
          </div>
          {readiness.status === 'error' && (
            <p className='mt-1 text-xs text-muted-foreground'>
              Please resolve the connection or compatibility issues before
              proceeding.
            </p>
          )}
          {readiness.status === 'success' && (
            <p className='mt-1 text-xs text-muted-foreground'>
              Dokku is already installed. You can proceed to configure plugins
              and settings.
            </p>
          )}
          {/* Action Button */}
          <div className='mt-6 border-t pt-4'>
            <div className='flex flex-col gap-2'>
              <Button
                onClick={handleStartProcess}
                disabled={!isServerReady || dokkuInstallationStep !== 1}
                className='w-full'
                size='lg'>
                <Play size={16} className='mr-2' />
                {getButtonText()}
              </Button>
              <p className='text-center text-xs text-muted-foreground'>
                {getButtonDescription()}
              </p>
              {!isServerReady && (
                <p className='text-center text-xs text-red-600'>
                  Please resolve server issues before proceeding
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Step1
