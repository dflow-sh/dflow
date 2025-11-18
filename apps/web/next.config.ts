import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@dflow/actions',
    '@dflow/components',
    '@dflow/providers',
    '@dflow/hooks',
    '@dflow/payload',
    '@dflow/lib',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default withPayload(nextConfig)
