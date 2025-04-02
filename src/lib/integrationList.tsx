import { GithubIcon } from 'lucide-react'

import { AmazonWebServices } from '@/components/icons'

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
    live: false,
    slug: 'aws',
  },
] as const
