'use client'

import '@xterm/xterm/css/xterm.css'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useState } from 'react'

import { createAppGithubAction } from '@/actions/createAppGithub'
import { createDatabaseAction } from '@/actions/createDatabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

export default function HomePage() {
  const [messages, setMessages] = useState<string[]>([])
  const [dbName, setDbName] = useState<string>('')
  const [appName, setAppName] = useState<string>('')

  const { toast } = useToast()

  const { execute: CreateDatabaseAction } = useAction(createDatabaseAction, {
    onSuccess: ({ data }) => {
      console.log({ data })
      setDbName('')
    },
    onError: ({ error }) => {
      toast({
        title: 'Failed to create database',
        description: error.serverError || 'An unknown error occurred',
      })
    },
  })

  const { execute: CreateAppGithubAction } = useAction(createAppGithubAction, {
    onSuccess: ({ data }) => {
      console.log({ data })
      setDbName('')
    },
    onError: ({ error }) => {
      toast({
        title: 'Failed to create database',
        description: error.serverError || 'An unknown error occurred',
      })
    },
  })

  useEffect(() => {
    const eventSource = new EventSource('/api/events')

    eventSource.onmessage = event => {
      setMessages(prev => [...prev, event.data])
    }

    return () => eventSource.close()
  }, [])

  return (
    <section className='space-y-6'>
      <div className='flex gap-8'>
        <Input
          value={dbName}
          onChange={e => {
            e.preventDefault()
            setDbName(e.target.value.toLowerCase())
          }}
          placeholder='Enter database name'
        />

        <Button onClick={() => CreateDatabaseAction({ dbName })}>
          Create DB
        </Button>
      </div>

      <div className='flex gap-8'>
        <Input
          value={appName}
          onChange={e => {
            e.preventDefault()
            setAppName(e.target.value.toLowerCase())
          }}
          placeholder='Enter App name'
        />

        <Button onClick={() => CreateAppGithubAction({ appName })}>
          Create App
        </Button>
      </div>

      <ul className='bg-gray-900'>
        {messages.map((msg, i) => (
          <li key={i} className='container text-gray-100'>
            {msg}
          </li>
        ))}
      </ul>
    </section>
  )
}
