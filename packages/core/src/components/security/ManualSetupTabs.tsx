'use client'

import { Tailscale } from "@core/components/icons"
import TailscaleForm from "@core/components/servers/TailscaleForm"
import UpdateTailscaleServerForm from "@core/components/servers/UpdateTailscaleServerForm"
import { Globe } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect } from 'react'

import AttachCustomServerForm from "@core/components/servers/AttachCustomServerForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@core/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/components/ui/tabs"
import { SshKey } from "@core/payload-types"
import { ServerType } from "@core/payload-types-overrides"

interface Props {
  sshKeys: SshKey[]
  server?: ServerType
  formType?: 'create' | 'update'
  onSuccess: (data: any) => void
}

const ManualSetupTabs = ({ sshKeys, server, formType, onSuccess }: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'tailscale'

  useEffect(() => {
    if (!searchParams.get('tab')) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', 'tailscale')
      router.replace(`?${params.toString()}`)
    }
  }, [searchParams, router])

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', value)
      router.push(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className='w-full'>
      <TabsList className='grid w-full max-w-md grid-cols-2'>
        <TabsTrigger value='tailscale' className='flex items-center gap-2'>
          <Tailscale />
          <span>Tailscale</span>
        </TabsTrigger>
        <TabsTrigger value='public' className='flex items-center gap-2'>
          <Globe className='h-4 w-4' />
          <span>Public</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value='tailscale' className='mt-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl'>Tailscale Setup</CardTitle>
            <CardDescription>
              Configure Tailscale for secure private network access
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formType === 'create' ? (
              <TailscaleForm />
            ) : (
              <UpdateTailscaleServerForm
                server={server}
                formType={formType}
                onSuccess={onSuccess}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='public' className='mt-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl'>Public Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <AttachCustomServerForm
              sshKeys={sshKeys}
              server={server}
              formType={formType}
              onSuccess={onSuccess}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export default ManualSetupTabs
