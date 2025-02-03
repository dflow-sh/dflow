import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  webpack(config) {
    // Handle .node files
    config.module.rules.push({
      test: /\.node$/,
      use: 'file-loader',
    })

    return config
  },
}

export default withPayload(nextConfig)
