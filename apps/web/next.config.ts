import path from 'path'
import { withBetterStack } from '@logtail/next'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // transpilePackages: ['@dflow/core'],

  // These will redirect old admin paths to new auth paths
  async redirects() {
    return [
      {
        source: '/payload-admin/login',
        destination: '/sign-in',
        permanent: false,
      },
      {
        source: '/payload-admin/create-first-user',
        destination: '/sign-up',
        permanent: false,
      },
    ]
  },

  // This will rewrite the events to posthog endpoint
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path(.*)',
        destination: 'https://us-assets.i.posthog.com/static/:path(.*)',
      },
      {
        source: '/ingest/:path(.*)',
        destination: 'https://us.i.posthog.com/:path(.*)',
      },
      {
        source: '/ingest/decide',
        destination: 'https://us.i.posthog.com/decide',
      },
    ]
  },

  serverExternalPackages: [
    '@dflow/core',
    'ssh2',
    'node-ssh',
    'bullmq',
    'ioredis',
  ],
  optimizePackageImports: false,

  experimental: {
    authInterrupts: true,
    globalNotFound: true,
    serverComponentsExternalPackages: ['@dflow/core'],
    typedRoutes: true,
  },

  webpack: (config, { isServer }) => {
    // 1. Add core alias
    config.resolve.alias['@core'] = path.resolve(
      __dirname,
      '../../packages/core/src',
    )

    // 2. Handle .node files
    config.module.rules.push({
      test: /\.node$/,
      use: 'file-loader',
    })

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bullmq: false,
        ssh2: false,
        'node-ssh': false,
      }
    }

    return config
  },

  output: 'standalone',
}

export default // withContentCollections(
withBetterStack(
  withPayload(nextConfig, {
    devBundleServerPackages: false,
  }),
)
// )
