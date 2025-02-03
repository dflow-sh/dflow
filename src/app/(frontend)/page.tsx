'use client'

import '@xterm/xterm/css/xterm.css'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'

import { createDatabaseAction } from '@/actions/createDatabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

export default function HomePage() {
  const [messages, setMessages] = useState<string[]>([])
  const [dbName, setDbName] = useState<string>('')

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

  return (
    <section className='space-y-6'>
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
