'use client'

import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { useEffect, useRef, useState } from 'react'

const useXterm = () => {
  const [terminalInstance, setTerminalInstance] = useState<Terminal>()
  const terminalRef = useRef<HTMLDivElement>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  // Function to write a log with timestamp and type
  const writeLog = ({ message }: { message: string }) => {
    if (terminalInstance) {
      message.split('\n').forEach(log => {
        // Write log with proper color formatting and line break
        terminalInstance.writeln(`${log}`)
      })
    }
  }

  useEffect(() => {
    const instance = new Terminal({
      fontFamily:
        'operator mono,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
      fontSize: 14,
      cursorStyle: 'underline',
      cursorBlink: false,
      theme: {
        background: '#344255',
      },
      convertEol: true,
      scrollback: 5000,
      // Set fixed columns and rows for stability in dialog
      cols: 80,
      rows: 20,
      allowTransparency: true,
    })

    if (terminalRef.current) {
      // Add FitAddon to automatically size the terminal to its container
      const fitAddon = new FitAddon()
      instance.loadAddon(new WebLinksAddon())
      instance.loadAddon(fitAddon)

      fitAddonRef.current = fitAddon

      // Mount terminal
      instance.open(terminalRef.current)
      // Fit the terminal to the container
      setTimeout(() => {
        fitAddon.fit()
      }, 100)
    }

    setTerminalInstance(instance)

    // On component unmount close the event source
    return () => {
      instance.dispose()
    }
  }, [])

  return {
    terminalRef,
    writeLog,
    terminalInstance,
  }
}

export default useXterm
