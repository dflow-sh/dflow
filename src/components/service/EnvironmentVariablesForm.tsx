'use client'

import { Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { ChangeEvent, ClipboardEvent, useState } from 'react'
import { toast } from 'sonner'

import { updateServiceAction } from '@/actions/service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Service } from '@/payload-types'

const VALID_KEY_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/

const EnvironmentVariablesForm = ({ service }: { service: Service }) => {
  const initialEnv =
    typeof service?.environmentVariables === 'object' &&
    service.environmentVariables
      ? Object.entries(service.environmentVariables).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      : []

  const [envVariables, setEnvVariables] =
    useState<{ key: string; value: string }[]>(initialEnv)
  const { serviceId } = useParams<{ id: string; serviceId: string }>()

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

  const isKeyValid = (key: string) => {
    return key.trim() !== '' && VALID_KEY_REGEX.test(key)
  }

  const areAllKeysValid = () => {
    const keys = envVariables.map(env => env.key.trim())
    const uniqueKeys = new Set(keys)
    return (
      keys.every(key => isKeyValid(key) || key === '') &&
      uniqueKeys.size === keys.length
    )
  }

  const isLastEntryValid = () => {
    if (envVariables.length === 0) return true
    const lastEntry = envVariables[envVariables.length - 1]
    return lastEntry.key.trim() === '' || isKeyValid(lastEntry.key)
  }

  const handleAddVariable = () => {
    setEnvVariables([...envVariables, { key: '', value: '' }])
  }

  const handleChange = (
    index: number,
    field: 'key' | 'value',
    newValue: string,
    isPasteEvent: boolean = false,
  ) => {
    const updatedEnv = [...envVariables]

    if (
      index === 0 &&
      field === 'key' &&
      isPasteEvent &&
      newValue.includes('\n')
    ) {
      const parsedEnv = parseEnvContent(newValue)
      setEnvVariables(
        parsedEnv.length > 0 ? parsedEnv : [{ key: '', value: '' }],
      )
      return
    }

    updatedEnv[index] = { ...updatedEnv[index], [field]: newValue }
    setEnvVariables(updatedEnv)
  }

  const handlePaste = (
    index: number,
    field: 'key' | 'value',
    event: ClipboardEvent<HTMLInputElement>,
  ) => {
    const pastedText = event.clipboardData.getData('text')
    if (pastedText.includes('\n')) {
      event.preventDefault()
      handleChange(index, field, pastedText, true)
    }
  }

  const parseEnvContent = (
    content: string,
  ): { key: string; value: string }[] => {
    const lines = content.split('\n').map(line => line.trim())
    const parsed: { key: string; value: string }[] = []

    for (const line of lines) {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=')
        const value = valueParts.join('=').trim()
        if (key.trim()) {
          parsed.push({ key: key.trim(), value: value || '' })
        }
      }
    }
    return parsed
  }

  const handleDelete = (index: number) => {
    setEnvVariables(envVariables.filter((_, i) => i !== index))
  }

  const handleSubmit = (noRestart?: boolean) => {
    if (!areAllKeysValid()) {
      toast.error('Invalid Environment Variables', {
        description:
          'Ensure all keys are unique, non-empty, and contain valid characters (A-Z, 0-9, _)',
      })
      return
    }

    const envObject = envVariables.reduce(
      (acc, { key, value }) => {
        if (key.trim()) acc[key] = value
        return acc
      },
      {} as Record<string, string>,
    )

    execute({
      environmentVariables: envObject,
      id: serviceId,
      noRestart,
    })
  }

  return (
    <div className='space-y-4'>
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='border-b'>
              <th className='p-2 text-left text-sm font-medium text-foreground'>
                Key
              </th>
              <th className='p-2 text-left text-sm font-medium text-foreground'>
                Value
              </th>
              <th className='p-2 text-left text-sm font-medium text-foreground'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {envVariables.map((env, index) => (
              <tr key={index} className=''>
                <td className='p-2'>
                  <Input
                    value={env.key}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleChange(index, 'key', e.target.value)
                    }
                    onPaste={(e: ClipboardEvent<HTMLInputElement>) =>
                      handlePaste(index, 'key', e)
                    }
                    placeholder='e.g., API_KEY'
                    className={`w-full ${!isKeyValid(env.key) && env.key !== '' ? 'border-red-500' : ''}`}
                    disabled={isPending}
                  />
                </td>
                <td className='p-2'>
                  <Input
                    value={env.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleChange(index, 'value', e.target.value)
                    }
                    onPaste={(e: ClipboardEvent<HTMLInputElement>) =>
                      handlePaste(index, 'value', e)
                    }
                    placeholder='e.g., abc123xyz'
                    className='w-full'
                    disabled={isPending}
                  />
                </td>
                <td className='p-2'>
                  <Button
                    variant='ghost'
                    size={'icon'}
                    onClick={() => handleDelete(index)}
                    disabled={isPending}>
                    <Trash2 className='h-4 w-4 text-red-500' />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='flex justify-start'>
        <Button
          variant='outline'
          onClick={handleAddVariable}
          disabled={isPending || !isLastEntryValid()}>
          + Add Variable
        </Button>
      </div>

      <div className='flex w-full justify-end gap-4'>
        <Button
          disabled={isPending || !areAllKeysValid()}
          variant='outline'
          onClick={() => handleSubmit(true)}>
          Save
        </Button>
        <Button
          disabled={isPending || !areAllKeysValid()}
          variant='secondary'
          onClick={() => handleSubmit(false)}>
          Save & Restart
        </Button>
      </div>
    </div>
  )
}

export default EnvironmentVariablesForm
