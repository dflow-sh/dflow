'use client'

import {
  AlertTriangle,
  Bell,
  Clock,
  Loader2,
  Mail,
  Save,
  Settings,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { defaultMonitoring } from '@/lib/default-monitoring'

interface MonitoringSettingsProps {
  serverId: string
  trigger?: React.ReactNode
}

const MonitoringSettings = ({ serverId, trigger }: MonitoringSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [settings, setSettings] = useState({
    alertThresholds: {
      cpu: 80,
      memory: 85,
      disk: 90,
    },
    refreshInterval: 30,
    enableEmailAlerts: false,
    alertEmail: '',
  })

  // Load settings when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const response = await defaultMonitoring.getMonitoringSettings(serverId)
      if (response.success) {
        setSettings(response.data)
      }
    } catch (error) {
      toast.error('Failed to load monitoring settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await defaultMonitoring.updateMonitoringSettings(
        serverId,
        settings,
      )
      if (response.success) {
        toast.success('Monitoring settings updated successfully')
        setIsOpen(false)
      } else {
        toast.error('Failed to update settings')
      }
    } catch (error) {
      toast.error('Failed to update monitoring settings')
    } finally {
      setIsSaving(false)
    }
  }

  const updateThreshold = (
    type: 'cpu' | 'memory' | 'disk',
    value: number[],
  ) => {
    setSettings(prev => ({
      ...prev,
      alertThresholds: {
        ...prev.alertThresholds,
        [type]: value[0],
      },
    }))
  }

  const defaultTrigger = (
    <Button variant='outline' size='sm'>
      <Settings className='h-4 w-4' />
      Settings
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

      <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Settings className='h-5 w-5' />
            Monitoring Settings
          </DialogTitle>
          <DialogDescription>
            Configure alert thresholds, notifications, and monitoring
            preferences
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-6 w-6 animate-spin' />
            <span className='ml-2'>Loading settings...</span>
          </div>
        ) : (
          <Tabs defaultValue='thresholds' className='w-full'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='thresholds'>Alert Thresholds</TabsTrigger>
              <TabsTrigger value='notifications'>Notifications</TabsTrigger>
              <TabsTrigger value='general'>General</TabsTrigger>
            </TabsList>

            <TabsContent value='thresholds' className='mt-6 space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <AlertTriangle className='h-4 w-4' />
                    Resource Alert Thresholds
                  </CardTitle>
                  <CardDescription>
                    Set the usage percentage that triggers alerts for each
                    resource
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* CPU Threshold */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor='cpu-threshold'>CPU Usage Alert</Label>
                      <span className='text-sm font-medium'>
                        {settings.alertThresholds.cpu}%
                      </span>
                    </div>
                    <Slider
                      id='cpu-threshold'
                      min={50}
                      max={95}
                      step={5}
                      value={[settings.alertThresholds.cpu]}
                      onValueChange={value => updateThreshold('cpu', value)}
                      className='w-full'
                    />
                    <p className='text-xs text-muted-foreground'>
                      Alert when CPU usage exceeds this percentage
                    </p>
                  </div>

                  <Separator />

                  {/* Memory Threshold */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor='memory-threshold'>
                        Memory Usage Alert
                      </Label>
                      <span className='text-sm font-medium'>
                        {settings.alertThresholds.memory}%
                      </span>
                    </div>
                    <Slider
                      id='memory-threshold'
                      min={60}
                      max={95}
                      step={5}
                      value={[settings.alertThresholds.memory]}
                      onValueChange={value => updateThreshold('memory', value)}
                      className='w-full'
                    />
                    <p className='text-xs text-muted-foreground'>
                      Alert when memory usage exceeds this percentage
                    </p>
                  </div>

                  <Separator />

                  {/* Disk Threshold */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor='disk-threshold'>Disk Usage Alert</Label>
                      <span className='text-sm font-medium'>
                        {settings.alertThresholds.disk}%
                      </span>
                    </div>
                    <Slider
                      id='disk-threshold'
                      min={70}
                      max={95}
                      step={5}
                      value={[settings.alertThresholds.disk]}
                      onValueChange={value => updateThreshold('disk', value)}
                      className='w-full'
                    />
                    <p className='text-xs text-muted-foreground'>
                      Alert when disk usage exceeds this percentage
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='notifications' className='mt-6 space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <Bell className='h-4 w-4' />
                    Alert Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure how you want to receive monitoring alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Email Alerts Toggle */}
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <Label className='flex items-center gap-2'>
                        <Mail className='h-4 w-4' />
                        Email Alerts
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Receive alert notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableEmailAlerts}
                      onCheckedChange={checked =>
                        setSettings(prev => ({
                          ...prev,
                          enableEmailAlerts: checked,
                        }))
                      }
                    />
                  </div>

                  {/* Email Address Input */}
                  {settings.enableEmailAlerts && (
                    <div className='space-y-2'>
                      <Label htmlFor='alert-email'>Alert Email Address</Label>
                      <Input
                        id='alert-email'
                        type='email'
                        placeholder='admin@example.com'
                        value={settings.alertEmail}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            alertEmail: e.target.value,
                          }))
                        }
                      />
                      <p className='text-xs text-muted-foreground'>
                        Alerts will be sent to this email address
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='general' className='mt-6 space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <Clock className='h-4 w-4' />
                    General Settings
                  </CardTitle>
                  <CardDescription>
                    Configure general monitoring behavior and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Refresh Interval */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor='refresh-interval'>
                        Data Refresh Interval
                      </Label>
                      <span className='text-sm font-medium'>
                        {settings.refreshInterval}s
                      </span>
                    </div>
                    <Slider
                      id='refresh-interval'
                      min={15}
                      max={300}
                      step={15}
                      value={[settings.refreshInterval]}
                      onValueChange={value =>
                        setSettings(prev => ({
                          ...prev,
                          refreshInterval: value[0],
                        }))
                      }
                      className='w-full'
                    />
                    <p className='text-xs text-muted-foreground'>
                      How often to refresh monitoring data (15-300 seconds)
                    </p>
                  </div>

                  <Separator />

                  {/* Additional Settings */}
                  <div className='space-y-4'>
                    <h4 className='text-sm font-medium'>Data Retention</h4>
                    <p className='text-sm text-muted-foreground'>
                      Monitoring data is retained for 30 days by default.
                      Historical data older than 30 days is automatically
                      archived.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Action Buttons */}
        <div className='flex justify-end gap-2 border-t pt-4'>
          <Button
            variant='outline'
            onClick={() => setIsOpen(false)}
            disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <Save className='mr-2 h-4 w-4' />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MonitoringSettings
