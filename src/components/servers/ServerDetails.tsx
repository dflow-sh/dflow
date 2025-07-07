'use client'

import RefreshButton from '../RefreshButton'
import { Dokku, Ubuntu } from '../icons'
import {
  AlertCircle,
  Check,
  Copy,
  Cpu,
  Globe,
  HardDrive,
  Info,
  MemoryStick,
  Server,
  X,
} from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { toast } from 'sonner'

import { withComingSoonBadge } from '@/components/ComingSoonBadge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import { supportedLinuxVersions } from '@/lib/constants'
import { ServerType } from '@/payload-types-overrides'

// Type Definitions
interface ServerDetails {
  kernel: Record<string, string>
  os: Record<string, string>
  hardware: {
    cpu: { cores: string; frequency: string; model: string }
    memory: { total: string; type: string }
    storage: { total: string }
    virtualization: { type: string; detection_method: string }
  }
  network: {
    hostname: string
    timezone: { name: string; abbreviation: string }
    cloud: { provider: string; instance_type: string; region: string }
  }
  system: Record<string, any>
  features: {
    collectors: string[]
    services: string[]
  }
}

// Define a type for the icon prop
type IconComponent = React.ComponentType<any>

// Define card data type
interface InfoCardProps {
  title: string
  value: string
  icon: IconComponent
}

// Compact card component
const CompactInfoCard = ({ title, value, icon: Icon }: InfoCardProps) => (
  <Card>
    <CardHeader className='pb-2'>
      <CardTitle className='flex items-center justify-between text-sm font-medium'>
        {title}
        <Icon className='h-4 w-4 text-muted-foreground' />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className='text-sm font-semibold text-muted-foreground'>{value}</div>
    </CardContent>
  </Card>
)

// Detailed info section
const DetailInfoSection = ({
  title,
  details,
}: {
  title: string
  details: Record<string, any>
}) => {
  const [isCopied, setIsCopied] = useState(false)

  const copyDetailsToClipboard = () => {
    // Prevent multiple clicks while in copied state
    if (isCopied) return

    const detailsText = Object.entries(details)
      .flatMap(([key, value]) =>
        typeof value === 'object' && value !== null
          ? Object.entries(value).map(
              ([subKey, subValue]) => `${key}.${subKey}: ${subValue}`,
            )
          : `${key}: ${value}`,
      )
      .join('\n')

    navigator.clipboard.writeText(detailsText)
    toast.success('Copied to Clipboard', {
      description: `${title} details have been copied.`,
    })

    // Change button state to copied
    setIsCopied(true)

    // Reset button state after 3 seconds
    const timer = setTimeout(() => {
      setIsCopied(false)
    }, 3000)

    // Cleanup the timer if component unmounts
    return () => clearTimeout(timer)
  }

  return (
    <div className='space-y-4 rounded-lg border-[0.5px] bg-background p-4'>
      <div className='flex items-center justify-between'>
        <h3 className='flex items-center gap-2 text-lg font-bold capitalize text-foreground'>
          <Info className='text-muted-foreground' size='16' /> {title}
        </h3>
        <Button
          variant='outline'
          disabled={isCopied}
          className={` ${
            isCopied
              ? 'cursor-not-allowed border-green-300 bg-green-100 text-green-700 opacity-50 hover:border-green-400 hover:bg-green-200 hover:text-green-700'
              : ''
          }`}
          size='sm'
          onClick={copyDetailsToClipboard}>
          {isCopied ? (
            <>
              <Check className='mr-2 h-4 w-4 text-green-700' /> Copied
            </>
          ) : (
            <>
              <Copy className='mr-2 h-4 w-4' /> Copy Details
            </>
          )}
        </Button>
      </div>
      <Separator className='h-[0.5px]' />
      <div className='grid gap-3 md:grid-cols-2'>
        {Object.entries(details).flatMap(([key, value]) =>
          typeof value === 'object' && value !== null
            ? Object.entries(value).map(([subKey, subValue]) => (
                <div
                  key={`${key}-${subKey}`}
                  className='flex items-center justify-between rounded-md bg-muted/35 p-2.5 transition-colors hover:bg-muted'>
                  <span className='text-sm font-medium capitalize text-foreground'>
                    {`${key} ${subKey}`.replace(/_/g, ' ')}
                  </span>
                  <span className='text-sm text-muted-foreground'>
                    {subValue !== null && subValue !== undefined
                      ? String(subValue)
                      : 'Not Specified'}
                  </span>
                </div>
              ))
            : [
                <div
                  key={key}
                  className='flex items-center justify-between rounded-md bg-muted/35 p-2.5 transition-colors hover:bg-muted'>
                  <span className='text-sm font-medium capitalize text-foreground'>
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className='text-sm text-muted-foreground'>
                    {value ?? 'Not Specified'}
                  </span>
                </div>,
              ],
        )}
      </div>
    </div>
  )
}

// Create a Terminal button with Coming Soon badge
const TerminalButton = withComingSoonBadge(Button, {
  text: 'Coming Soon',
  position: 'top-right',
})

const ServerDetails = ({
  serverDetails,
  server,
}: {
  serverDetails: ServerDetails | null
  server: ServerType
}) => {
  // Function to handle opening terminal in new window
  const handleOpenTerminal = () => {
    // Open terminal in a new window - adjust the URL as needed based on your setup
    window.open(
      `http://localhost:3000/servers/${server.id}`,
      '_blank',
      'width=1024,height=768',
    )
  }

  // Base card data that should always be shown
  const baseCardData: InfoCardProps[] = []

  // Only add OS info if version exists
  if (server.os?.version) {
    baseCardData.push({
      title: 'Operating System',
      value: server.os.version,
      icon: Ubuntu,
    })
  }

  // Only add Dokku version if it exists
  if (server.version) {
    baseCardData.push({
      title: 'Dokku Version',
      value: server.version,
      icon: Dokku,
    })
  }

  // Only add netdata cards if netdataVersion exists AND serverDetails is available
  let cardData: InfoCardProps[] = [...baseCardData]

  // Check if netdata is installed and details are available
  const isNetdataAvailable =
    server.netdataVersion &&
    serverDetails &&
    serverDetails.hardware &&
    serverDetails.network &&
    serverDetails.kernel

  if (isNetdataAvailable) {
    // Additional netdata cards that should only be shown if netdataVersion exists
    const netdataCardData: InfoCardProps[] = [
      {
        title: 'CPU',
        value: `${serverDetails.hardware.cpu.cores || 'Unknown'} Cores @ ${serverDetails.hardware.cpu.frequency || 'Unknown'} (${serverDetails.kernel.architecture || 'Unknown'})`,
        icon: Cpu,
      },
      {
        title: 'RAM',
        value: serverDetails.hardware.memory.total || 'Unknown',
        icon: MemoryStick,
      },
      {
        title: 'Disk',
        value: serverDetails.hardware.storage.total || 'Unknown',
        icon: HardDrive,
      },
      {
        title: 'Hostname',
        value: serverDetails.network.hostname || 'Unknown',
        icon: Server,
      },
      {
        title: 'Virtualization',
        value: serverDetails.hardware.virtualization.type || 'Unknown',
        icon: Globe,
      },
      {
        title: 'Kernel',
        value: `${serverDetails.kernel.name || 'Unknown'} ${serverDetails.kernel.version || ''}`,
        icon: Info,
      },
    ]

    // Add netdata cards to the card data
    cardData = [...baseCardData, ...netdataCardData]
  }

  // Check if terminal is available
  const isTerminalAvailable = server.connection?.status === 'success'
  // && server.terminalInstalled

  return (
    <div className='space-y-4'>
      {/* OS Version Alert - Keep this one as it's specific to this component */}
      {server.os?.version &&
        !supportedLinuxVersions.includes(server.os.version) && (
          <Alert variant='destructive' className='mb-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Unsupported OS</AlertTitle>
            <AlertDescription>
              {`Dokku doesn't support ${server.os.type} ${server.os.version}, check `}{' '}
              <Link
                className='underline'
                href='https://dokku.com/docs/getting-started/installation/#system-requirements'
                target='_blank'
                rel='noopener noreferrer'>
                docs
              </Link>{' '}
              for more details.
            </AlertDescription>
          </Alert>
        )}

      {/* Server Information */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1.5'>
          <Server />
          <h4 className='text-lg font-semibold'>{server.name}</h4>
        </div>

        <div className='flex items-center space-x-2'>
          <RefreshButton showText={true} text='Refresh Server Status' />

          {isNetdataAvailable && (
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant='outline'>
                  <Info className='mr-2 h-4 w-4' /> View Complete Details
                </Button>
              </DrawerTrigger>
              <DrawerContent className='b-10 h-[90%]'>
                <DrawerHeader>
                  <div className='flex items-center justify-between'>
                    <DrawerTitle className='flex items-center gap-2'>
                      <Server className='h-5 w-5 text-muted-foreground' />
                      Comprehensive Server Details
                    </DrawerTitle>
                    <DrawerClose asChild>
                      <Button variant='ghost' size='icon'>
                        <X className='h-5 w-5' />
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>

                <div className='space-y-6 overflow-y-auto px-4 py-2 pb-16'>
                  {serverDetails &&
                    Object.entries(serverDetails).map(([section, details]) => (
                      <DetailInfoSection
                        key={section}
                        title={section}
                        details={details}
                      />
                    ))}
                </div>
              </DrawerContent>
            </Drawer>
          )}

          {/* {server.connection?.status === 'success' && (
            <TerminalButton
              variant='outline'
              size='sm'
              disabled={true}
              onClick={handleOpenTerminal}>
              <Terminal className='mr-1 h-3 w-3' />
              <span className='text-xs'>Open Terminal</span>
            </TerminalButton>
          )} */}
        </div>
      </div>

      {cardData.length > 0 ? (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
          {cardData.map((card, index) => (
            <CompactInfoCard key={index} {...card} />
          ))}
        </div>
      ) : (
        <Alert
          variant='default'
          className='mt-0 bg-muted/50 text-muted-foreground'>
          <Info className='h-4 w-4' />
          <AlertTitle>No Server Information Available</AlertTitle>
          <AlertDescription>
            Connect to your server to view detailed information.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default ServerDetails
