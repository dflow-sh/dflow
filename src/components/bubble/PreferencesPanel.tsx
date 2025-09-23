'use client'

import { ArrowLeft, Monitor, Moon, Sun } from 'lucide-react'
import { motion } from 'motion/react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
type Theme = 'light' | 'dark' | 'system'
type Size = 'small' | 'medium' | 'large'

interface Preferences {
  position: Position
  theme: Theme
  size: Size
  visible: boolean
}

const PreferencesPanel = ({
  preferences,
  onUpdate,
  onBack,
}: {
  preferences: Preferences
  onUpdate: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void
  onBack: () => void
}) => {
  return (
    <motion.div
      key='preferences'
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className='flex h-full flex-col p-6'>
      {/* Header */}
      <div className='mb-6 flex items-center'>
        <Button
          variant='ghost'
          size='icon'
          onClick={onBack}
          className='mr-3 h-9 w-9'>
          <ArrowLeft size={16} />
        </Button>
        <div className='min-w-0'>
          <h2 className='text-foreground truncate text-xl font-semibold'>
            Preferences
          </h2>
          <p className='text-muted-foreground mt-1 truncate text-sm'>
            Customize your bubble experience
          </p>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className='flex-1'>
        <div className='space-y-6 pr-3 pb-4'>
          {/* Position Setting */}
          <div className='space-y-3'>
            <Label className='text-foreground text-sm font-medium'>
              Position
            </Label>
            <Select
              value={preferences.position}
              onValueChange={(value: Position) => onUpdate('position', value)}>
              <SelectTrigger className='h-12 text-sm'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='bottom-right' className='text-sm'>
                  <div className='flex items-center gap-3'>
                    <div className='border-border bg-muted relative h-5 w-5 rounded-sm border'>
                      <div className='bg-primary absolute right-0 bottom-0 h-1.5 w-1.5 translate-x-0.5 translate-y-0.5 transform rounded-full' />
                    </div>
                    Bottom Right
                  </div>
                </SelectItem>
                <SelectItem value='bottom-left' className='text-sm'>
                  <div className='flex items-center gap-3'>
                    <div className='border-border bg-muted relative h-5 w-5 rounded-sm border'>
                      <div className='bg-primary absolute bottom-0 left-0 h-1.5 w-1.5 -translate-x-0.5 translate-y-0.5 transform rounded-full' />
                    </div>
                    Bottom Left
                  </div>
                </SelectItem>
                <SelectItem value='top-right' className='text-sm'>
                  <div className='flex items-center gap-3'>
                    <div className='border-border bg-muted relative h-5 w-5 rounded-sm border'>
                      <div className='bg-primary absolute top-0 right-0 h-1.5 w-1.5 translate-x-0.5 -translate-y-0.5 transform rounded-full' />
                    </div>
                    Top Right
                  </div>
                </SelectItem>
                <SelectItem value='top-left' className='text-sm'>
                  <div className='flex items-center gap-3'>
                    <div className='border-border bg-muted relative h-5 w-5 rounded-sm border'>
                      <div className='bg-primary absolute top-0 left-0 h-1.5 w-1.5 -translate-x-0.5 -translate-y-0.5 transform rounded-full' />
                    </div>
                    Top Left
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme Setting */}
          <div className='space-y-3'>
            <Label className='text-foreground text-sm font-medium'>Theme</Label>
            <Select
              value={preferences.theme}
              onValueChange={(value: Theme) => onUpdate('theme', value)}>
              <SelectTrigger className='h-12 text-sm'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='light' className='text-sm'>
                  <div className='flex items-center gap-3'>
                    <Sun size={16} />
                    Light Mode
                  </div>
                </SelectItem>
                <SelectItem value='dark' className='text-sm'>
                  <div className='flex items-center gap-3'>
                    <Moon size={16} />
                    Dark Mode
                  </div>
                </SelectItem>
                <SelectItem value='system' className='text-sm'>
                  <div className='flex items-center gap-3'>
                    <Monitor size={16} />
                    System Default
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Size Setting */}
          <div className='space-y-3'>
            <Label className='text-foreground text-sm font-medium'>
              Bubble Size
            </Label>
            <Select
              value={preferences.size}
              onValueChange={(value: Size) => onUpdate('size', value)}>
              <SelectTrigger className='h-12 text-sm'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='small' className='text-sm'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-primary h-2.5 w-2.5 rounded-full' />
                    Small
                  </div>
                </SelectItem>
                <SelectItem value='medium' className='text-sm'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-primary h-3 w-3 rounded-full' />
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value='large' className='text-sm'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-primary h-3.5 w-3.5 rounded-full' />
                    Large
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Visibility Toggle */}
          <div className='bg-muted/30 flex items-center justify-between rounded-lg border p-4'>
            <div className='min-w-0'>
              <Label className='text-foreground text-sm font-medium'>
                Bubble Visibility
              </Label>
              <p className='text-muted-foreground mt-1 text-xs'>
                Show or hide the floating bubble
              </p>
            </div>
            <Switch
              checked={preferences.visible}
              onCheckedChange={checked => onUpdate('visible', checked)}
            />
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  )
}

export default PreferencesPanel
