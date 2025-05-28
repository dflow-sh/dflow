import { GithubIcon } from 'lucide-react'

import {
  AmazonWebServices,
  Azure,
  DigitalOcean,
  Docker,
  GoogleCloudPlatform,
  dFlow,
} from '@/components/icons'

export const integrationsList = [
  {
    label: 'dFlow',
    icon: dFlow,
    description: 'Manage your dFlow account & servers',
    slug: 'dflow',
    live: true,
  },
  {
    label: 'Amazon Web Services',
    icon: AmazonWebServices,
    description: 'Manage your AWS account EC2 instances',
    live: true,
    slug: 'aws',
  },
  {
    label: 'Github',
    icon: GithubIcon,
    description:
      'Start deploying your applications by installing Github app on your account',
    live: true,
    slug: 'github',
  },
  {
    label: 'Docker Registry',
    icon: Docker,
    description: 'Deploy docker images from your preferred registries',
    live: true,
    slug: 'docker-registry',
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
