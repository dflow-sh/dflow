import { withBetterStack } from '@logtail/next'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@dflow/actions',
    '@dflow/components',
    '@dflow/providers',
    '@dflow/hooks',
    '@dflow/payload',
    '@dflow/lib',
    '@dflow/stores',
    '@dflow/types',
    '@dflow/emails',
  ],

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

  serverExternalPackages: ['bullmq', 'ssh2', 'node-ssh'],

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    authInterrupts: true,
    globalNotFound: true,
  },

  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.node$/,
      use: 'file-loader',
    })

    if (isServer) {
      config.externals.push({
        'cpu-features': 'commonjs cpu-features',
        ssh2: 'commonjs ssh2',
        'node-ssh': 'commonjs node-ssh',
        bullmq: 'commonjs bullmq',
      })
    } else {
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

export default withBetterStack(
  withPayload(nextConfig, {
    devBundleServerPackages: false,
  }),
)
