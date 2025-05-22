'use client'

import { useEffect, useState } from 'react'

import { User } from '@/payload-types'

import { Discord } from './icons'
import { Button } from './ui/button'

interface DiscordInfo {
  id: string
  username: string
  avatar?: string | null
}

export default function ConnectDiscordButton({ user }: { user: User }) {
  const [isConnected, setIsConnected] = useState(false)
  const [discordUsername, setDiscordUsername] = useState('')

  useEffect(() => {
    if (user?.discord?.discordId) {
      setIsConnected(true)
      setDiscordUsername(user.discord.discordUsername || '')
    } else {
      setIsConnected(false)
      setDiscordUsername('')
    }
  }, [user])

  const handleConnect = () => {
    window.location.href = '/api/auth/discord'
  }

  const handleDisconnect = async () => {
    await fetch('/api/auth/discord/disconnect', { method: 'POST' })
    setIsConnected(false)
    setDiscordUsername('')
  }

  if (isConnected) {
    return (
      <Button variant='destructive' onClick={handleDisconnect}>
        <Discord />
        <div className='flex flex-col items-start text-xs'>
          <span className='font-medium'>{discordUsername}</span>
          <span>Disconnect Discord</span>
        </div>
      </Button>
    )
  }

  return (
    <Button
      onClick={handleConnect}
      variant='outline'
      className='flex items-center gap-2'>
      <Discord />
      Connect Discord
    </Button>
  )
}
