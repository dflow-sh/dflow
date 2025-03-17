'use client'

import { useAction } from 'next-safe-action/hooks'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { updateServiceAction } from '@/actions/service'
import Loader from '@/components/Loader'
import { Button } from '@/components/ui/button'
import { Service } from '@/payload-types'

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
})

const EnvironmentVariablesForm = ({ service }: { service: Service }) => {
  const [mounted, setMounted] = useState(false)

  const [environmentVariables, setEnvironmentVariables] = useState(
    typeof service?.environmentVariables === 'object'
      ? JSON.stringify(service.environmentVariables, null, 2)
      : JSON.stringify({}, null, 2),
  )
  const { serviceId } = useParams<{
    id: string
    serviceId: string
  }>()

  const { execute, isPending } = useAction(updateServiceAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.info('Added updating environment-variables to queue', {
          description: 'Restart service to apply changes',
          duration: 5000,
        })
      }
    },
    onError: ({ error }) => {
      toast.error(
        `Failed to update environment variables: ${error?.serverError}`,
      )
    },
  })

  const handleSubmit = (noRestart?: boolean) => {
    try {
      const env = JSON.parse(environmentVariables)

      execute({
        environmentVariables: env,
        id: serviceId,
        noRestart,
      })
    } catch (error) {
      console.log('Error parsing environment variables', error)
      toast.error('Invalid Format', {
        description: 'Environment variables are in invalid format',
      })
    }
  }

  return (
    <>
      <div className='h-96 space-y-4'>
        <Editor
          height='100%'
          defaultLanguage='json'
          defaultValue={environmentVariables}
          theme='vs-dark'
          options={{
            minimap: { enabled: false },
            automaticLayout: true,
            wordWrap: 'on',
            wrappingIndent: 'same',
            wrappingStrategy: 'advanced',
            wordWrapColumn: 80,
            wordWrapBreakBeforeCharacters: '{([+',
            wordWrapBreakAfterCharacters: '})]+&|',
          }}
          onChange={value => {
            setEnvironmentVariables(value ?? '')
          }}
          loading={<Loader className='h-96 w-full' />}
          onMount={() => {
            setMounted(true)
          }}
        />

        {mounted && (
          <div className='flex w-full justify-end gap-4'>
            <Button
              disabled={isPending}
              variant='outline'
              onClick={() => {
                handleSubmit()
              }}>
              Save
            </Button>

            <Button
              disabled={isPending}
              variant='secondary'
              onClick={() => {
                handleSubmit(false)
              }}>
              Save & Restart
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

export default EnvironmentVariablesForm
