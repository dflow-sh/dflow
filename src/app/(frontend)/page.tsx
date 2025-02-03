'use client'

import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useRef } from 'react'

import { exampleAction } from '@/actions/example'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const terminal = new Terminal()
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = terminalRef.current
    if (container) {
      terminal.open(container)
      terminal.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
    }
  }, [])

  const { execute } = useAction(exampleAction, {
    onSuccess: ({ data }) => {
      console.log({ data })
    },
  })

  return (
    <section className='space-y-6'>
      <Button
        onClick={() => {
          execute({ email: 'dflow@gmail.com', name: 'dflow' })
        }}>
        Trigger Example Action
      </Button>

      <div ref={terminalRef} className='overflow-y-scroll' />
    </section>
  )
}
