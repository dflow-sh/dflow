'use client'

import { ArrowLeft, Monitor, Moon, Sun, Terminal } from 'lucide-react'
import { motion } from 'motion/react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useBubble } from '@/providers/BubbleProvider'
import { useTerminal } from '@/providers/TerminalProvider'

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
type Theme = 'light' | 'dark' | 'system'
type Size = 'small' | 'medium' | 'large'
type TerminalMode = 'embedded' | 'floating' | 'fullscreen'

const PreferencesPanel = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { goBack, bubblePreferences, updateBubblePreference } = useBubble()
  const { terminalPreferences, updateTerminalPreference } = useTerminal()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (mounted && theme) {
      updateBubblePreference('theme', theme as Theme)
    }
  }, [theme, mounted])

  // Handle terminal mode change - just update preference without opening terminal
  const handleTerminalModeChange = (value: TerminalMode) => {
    updateTerminalPreference('terminalMode', value)
    // Note: This only updates the preference, doesn't open the terminal
  }

  if (!mounted) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-muted-foreground'>Loading...</div>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col'>
      {/* STICKY HEADER */}
      <div className='bg-background/95 border-border/50 sticky top-0 z-10 border-b backdrop-blur-sm'>
        <div className='flex items-center p-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={goBack}
            className='mr-3 h-8 w-8'>
            <ArrowLeft size={14} />
          </Button>
          <div>
            <h2 className='text-foreground text-lg font-semibold'>Settings</h2>
            <p className='text-muted-foreground text-xs'>
              Customize your interface preferences
            </p>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className='flex-1 overflow-hidden'>
        <div className='h-full overflow-y-auto'>
          <div className='space-y-6 p-4'>
            {/* Position Setting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className='space-y-3'>
              <Label className='text-foreground text-sm font-medium'>
                Bubble Position
              </Label>
              <Select
                value={bubblePreferences.position}
                onValueChange={(value: Position) =>
                  updateBubblePreference('position', value)
                }>
                <SelectTrigger className='h-12'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='z-[2147483600]'>
                  <SelectItem value='bottom-right'>
                    <div className='flex items-center gap-3'>
                      <div className='border-border bg-muted relative h-5 w-5 rounded-sm border'>
                        <div className='bg-primary absolute right-0 bottom-0 h-2 w-2 translate-x-0.5 translate-y-0.5 transform rounded-full' />
                      </div>
                      Bottom Right
                    </div>
                  </SelectItem>
                  <SelectItem value='bottom-left'>
                    <div className='flex items-center gap-3'>
                      <div className='border-border bg-muted relative h-5 w-5 rounded-sm border'>
                        <div className='bg-primary absolute bottom-0 left-0 h-2 w-2 -translate-x-0.5 translate-y-0.5 transform rounded-full' />
                      </div>
                      Bottom Left
                    </div>
                  </SelectItem>
                  <SelectItem value='top-right'>
                    <div className='flex items-center gap-3'>
                      <div className='border-border bg-muted relative h-5 w-5 rounded-sm border'>
                        <div className='bg-primary absolute top-0 right-0 h-2 w-2 translate-x-0.5 -translate-y-0.5 transform rounded-full' />
                      </div>
                      Top Right
                    </div>
                  </SelectItem>
                  <SelectItem value='top-left'>
                    <div className='flex items-center gap-3'>
                      <div className='border-border bg-muted relative h-5 w-5 rounded-sm border'>
                        <div className='bg-primary absolute top-0 left-0 h-2 w-2 -translate-x-0.5 -translate-y-0.5 transform rounded-full' />
                      </div>
                      Top Left
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Theme Setting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='space-y-3'>
              <Label className='text-foreground text-sm font-medium'>
                Theme Mode
              </Label>

              {/* Current Theme Display */}
              <div className='bg-muted/30 rounded-lg border p-3'>
                <div className='flex items-center gap-3'>
                  <div className='bg-background flex h-8 w-8 items-center justify-center rounded-md border'>
                    {theme === 'dark' ? (
                      <Moon size={14} className='text-foreground' />
                    ) : theme === 'light' ? (
                      <Sun size={14} className='text-foreground' />
                    ) : (
                      <Monitor size={14} className='text-foreground' />
                    )}
                  </div>
                  <div className='flex-1'>
                    <div className='text-foreground text-sm font-medium'>
                      Current:{' '}
                      {theme === 'dark'
                        ? 'Dark Mode'
                        : theme === 'light'
                          ? 'Light Mode'
                          : 'System Mode'}
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      {theme === 'system'
                        ? 'Automatically follows your system preference'
                        : theme === 'dark'
                          ? 'Dark theme is active'
                          : 'Light theme is active'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Controls */}
              <div className='space-y-2'>
                <div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
                  Switch Theme
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setTheme('light')}
                    className={cn(
                      'flex-1 justify-start gap-2',
                      theme === 'light' && 'bg-primary text-primary-foreground',
                    )}>
                    <Sun size={14} />
                    Light
                  </Button>

                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setTheme('dark')}
                    className={cn(
                      'flex-1 justify-start gap-2',
                      theme === 'dark' && 'bg-primary text-primary-foreground',
                    )}>
                    <Moon size={14} />
                    Dark
                  </Button>

                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setTheme('system')}
                    className={cn(
                      'flex-1 justify-start gap-2',
                      theme === 'system' &&
                        'bg-primary text-primary-foreground',
                    )}>
                    <Monitor size={14} />
                    Auto
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Preferred Terminal Setting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className='space-y-3'>
              <Label className='text-foreground text-sm font-medium'>
                Preferred Terminal Mode
              </Label>
              <Select
                value={terminalPreferences.terminalMode}
                onValueChange={handleTerminalModeChange}>
                <SelectTrigger className='h-12'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='z-[2147483600]'>
                  <SelectItem value='embedded'>
                    <div className='flex items-center gap-3'>
                      <div className='border-border bg-muted flex h-5 w-5 items-center justify-center rounded-sm border'>
                        <Terminal size={12} className='text-foreground' />
                      </div>
                      Embedded (Default)
                    </div>
                  </SelectItem>
                  <SelectItem value='floating'>
                    <div className='flex items-center gap-3'>
                      <div className='border-border bg-muted flex h-5 w-5 items-center justify-center rounded-sm border'>
                        <Terminal size={12} className='text-foreground' />
                      </div>
                      Floating Panel
                    </div>
                  </SelectItem>
                  <SelectItem value='fullscreen'>
                    <div className='flex items-center gap-3'>
                      <div className='border-border bg-muted flex h-5 w-5 items-center justify-center rounded-sm border'>
                        <Terminal size={12} className='text-foreground' />
                      </div>
                      Full Screen
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className='text-muted-foreground text-xs'>
                Choose your preferred terminal mode. This only sets the default
                behavior - the terminal will open in this mode when you click
                "Open Terminal".
              </p>
            </motion.div>

            {/* Size Setting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='space-y-3'>
              <Label className='text-foreground text-sm font-medium'>
                Bubble Size
              </Label>
              <Select
                value={bubblePreferences.size}
                onValueChange={(value: Size) =>
                  updateBubblePreference('size', value)
                }>
                <SelectTrigger className='h-12'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='z-[2147483600]'>
                  <SelectItem value='small'>
                    <div className='flex items-center gap-2'>
                      <div className='bg-primary h-3 w-3 rounded-full' />
                      Small (48px)
                    </div>
                  </SelectItem>
                  <SelectItem value='medium'>
                    <div className='flex items-center gap-2'>
                      <div className='bg-primary h-4 w-4 rounded-full' />
                      Medium (56px)
                    </div>
                  </SelectItem>
                  <SelectItem value='large'>
                    <div className='flex items-center gap-2'>
                      <div className='bg-primary h-5 w-5 rounded-full' />
                      Large (64px)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Visibility Toggle */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className='bg-muted/30 flex items-center justify-between rounded-xl border p-4'>
              <div>
                <Label className='text-foreground text-sm font-medium'>
                  Show Bubble
                </Label>
                <p className='text-muted-foreground text-xs'>
                  Toggle bubble visibility
                </p>
              </div>
              <Switch
                checked={preferences.visible}
                onCheckedChange={checked =>
                  updatePreference('visible', checked)
                }
              />
            </motion.div> */}

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className='bg-muted/20 rounded-xl border p-4'>
              <div className='text-muted-foreground space-y-2 text-xs'>
                <p className='text-foreground font-medium'>💡 Tips:</p>
                <ul className='ml-2 space-y-1'>
                  <li>• Position bubble away from your main work area</li>
                  <li>• Use "Auto" theme to match your system preference</li>
                  <li>• Larger bubbles are easier to click on mobile</li>
                  <li>• Embedded terminal stays at bottom of page</li>
                  <li>• Floating terminal appears in the bubble panel</li>
                  <li>• Fullscreen terminal takes the entire screen</li>
                  <li>
                    • Changing preferences doesn't automatically open the
                    terminal
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreferencesPanel
