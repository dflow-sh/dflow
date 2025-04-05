import { GithubIcon } from 'lucide-react'

import {
  AmazonWebServices,
  Azure,
  DigitalOcean,
  GoogleCloudPlatform,
} from '@/components/icons'

export const integrationsList = [
  {
    label: 'Github',
    icon: GithubIcon,
    description:
      'Start deploying your applications by installing Github app on your account',
    live: true,
    slug: 'github',
  },
  {
    label: 'Amazon Web Services',
    icon: AmazonWebServices,
    description: 'Manage your AWS account EC2 instances',
    live: true,
    slug: 'aws',
  },
] as const

export const cloudProvidersList = [
  {
    label: 'Amazon Web Services',
    Icon: AmazonWebServices,
    live: true,
    slug: 'aws',
  },
  {
    label: 'Google Cloud Platform',
    Icon: GoogleCloudPlatform,
    live: false,
    slug: 'gcp',
  },
  {
    label: 'Azure',
    Icon: Azure,
    live: false,
    slug: 'azure',
  },
  {
    label: 'DigitalOcean',
    Icon: DigitalOcean,
    live: false,
    slug: 'digitalocean',
  },
] as const
