'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Tag, TagInput } from 'emblor'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { toast } from 'sonner'

import { exposeDatabasePortAction } from '@/actions/service'
import { numberRegex } from '@/lib/constants'
import { Service } from '@/payload-types'

const PortForm = ({ service }: { service: Service }) => {
  const [tags, setTags] = useState<Tag[]>(
    service.databaseDetails?.exposedPorts
      ? service.databaseDetails?.exposedPorts.map(port => ({
          id: port,
          text: port,
        }))
      : [],
  )
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)

  const { execute: exposePort, isPending: isExposingPort } = useAction(
    exposeDatabasePortAction,
    {
      onSuccess: ({ data, input }) => {
        if (data?.success) {
          toast.info('Added to queue', {
            description: `Added exposing of ${input.ports.join(', ')} ports to queue`,
          })
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to expose port: ${error.serverError}`, {
          duration: 5000,
        })
      },
    },
  )

  return (
    <div className='rounded bg-muted/30 p-4'>
      <h3 className='text-lg font-semibold'>External Credentials</h3>
      <p className='text-pretty text-muted-foreground'>
        In order to make your database reachable over internet setting a port is
        required. make sure port is not used by other database or application
      </p>

      <div className='mt-4 space-y-6'>
        <TagInput
          placeholder='Enter ports'
          type='number'
          placeholderWhenFull='Max ports reached'
          tags={tags}
          setTags={newTags => {
            if (Array.isArray(newTags)) {
              setTags(newTags.filter(tag => numberRegex.test(tag.text)))
            }
          }}
          maxTags={service.databaseDetails?.type === 'mongo' ? 4 : 1}
          activeTagIndex={activeTagIndex}
          setActiveTagIndex={setActiveTagIndex}
        />

        <div className='flex w-full justify-end'>
          <Button
            type='submit'
            variant='outline'
            disabled={!tags.length || isExposingPort}
            onClick={() => {
              if (
                service.databaseDetails?.type === 'mongo' &&
                tags.length < 4
              ) {
                return toast.error('Mongo database requires 4 ports', {
                  description: 'example ports: 27017, 27018, 27019, 27020',
                })
              }

              if (!tags.length) {
                return toast.error('Ports are required')
              }

              exposePort({
                id: service.id,
                ports: tags.map(({ text }) => text),
              })
            }}>
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

const DatabaseForm = ({ service }: { service: Service }) => {
  const { databaseDetails } = service

  return (
    <>
      <div className='space-y-4 rounded bg-muted/30 p-4'>
        <h3 className='text-lg font-semibold'>Internal Credentials</h3>

        <form className='w-full space-y-6'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Username</Label>
              <Input disabled value={databaseDetails?.username ?? '-'} />
            </div>

            <div className='space-y-2'>
              <Label>Password</Label>
              <Input disabled value={databaseDetails?.password ?? '-'} />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Port</Label>
              <Input disabled value={databaseDetails?.port ?? '-'} />
            </div>

            <div className='space-y-2'>
              <Label>Host</Label>
              <Input disabled value={databaseDetails?.host ?? '-'} />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Internal connection url</Label>
            <Input disabled value={databaseDetails?.connectionUrl ?? '-'} />
          </div>
        </form>
      </div>

      <PortForm service={service} />
    </>
  )
}

export default DatabaseForm
