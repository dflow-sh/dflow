import { SquareTerminal } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useQueryState } from 'nuqs'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { installDokkuAction } from '@/actions/server'
import Terminal from '@/components/Terminal'
import { supportedLinuxVersions } from '@/lib/constants'
import { ServerType } from '@/payload-types-overrides'

import { useInstallationStep } from './InstallationStepContext'

const Step2 = ({ server }: { server: ServerType }) => {
  const [messages, setMessages] = useState<string[]>([])
  const eventSourcesRef = useRef<EventSource>(null)
  const [selectedServer] = useQueryState('server')
  const { setStep, step } = useInstallationStep()

  const {
    execute: installDokku,
    isPending: isInstallingDokku,
    hasSucceeded,
  } = useAction(installDokkuAction, {
    onExecute: ({ input }) => {
      toast.loading('Adding dokku installation to queue', {
        id: input.serverId,
      })
    },
    onSuccess: ({ data, input }) => {
      if (data?.success) {
        toast.info('Added to queue', {
          description: 'Added dokku installation to queue',
          id: input.serverId,
        })

        const eventSource = new EventSource(
          `/api/server-events?serverId=${input.serverId}`,
        )

        eventSource.onmessage = event => {
          const data = JSON.parse(event.data) ?? {}

          if (data?.message) {
            setMessages(prev => [...prev, data.message])
          }
        }

        // Store the event source in our ref
        eventSourcesRef.current = eventSource
      }
    },
  })

  useEffect(() => {
    if (selectedServer && step === 2) {
      if (server.version && server.version !== 'not-installed') {
        if (!hasSucceeded) {
          setMessages([
            `Skipping dokku installation: found dokku ${server.version}`,
          ])
        }

        setStep(3)
      }
      // Need to call queue
      else if (
        server.portIsOpen &&
        server.sshConnected &&
        supportedLinuxVersions.includes(server.os.version ?? '')
      ) {
        installDokku({ serverId: selectedServer })
      }
    }

    // Closing when step is 3
    if (step > 2) {
      eventSourcesRef.current?.close()
    }
  }, [selectedServer, server, step])

  // Closing event source on component unmount
  useEffect(() => {
    return () => {
      eventSourcesRef.current?.close()
    }
  }, [])

  return (
    <div>
      <p className='inline-flex items-center gap-1'>
        <SquareTerminal size={16} />
        Terminal
      </p>
      <Terminal isLoading={isInstallingDokku} messages={messages} />
    </div>
  )
}

export default Step2
