'use client'

import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'
import { env } from 'env'
import { useRouter } from 'next/navigation'
import React from 'react'

export const LivePreviewListener: React.FC = () => {
  const router = useRouter()

  return (
    <PayloadLivePreview
      refresh={router.refresh}
      serverURL={`${env.NEXT_PUBLIC_WEBSITE_URL}/admin/dashboard`}
    />
  )
}
