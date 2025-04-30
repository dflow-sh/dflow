import { withContentCollections } from '@content-collections/next'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['bullmq', 'ssh2', 'node-ssh'],
  webpack: (config, { isServer }) => {
    // Handle .node files
    config.module.rules.push({
      test: /\.node$/,
      use: 'file-loader',
    })

    if (!isServer) {
      // Don't attempt to load these packages on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bullmq: false,
        ssh2: false,
        'node-ssh': false,
      }
    }

    return config
  },
  // output: 'standalone',
}

export default withContentCollections(withPayload(nextConfig))
