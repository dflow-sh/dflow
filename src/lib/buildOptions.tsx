import { Hammer } from 'lucide-react'

import { Docker, Heroku } from '@/components/icons'

export const buildOptions = [
  {
    label: 'Default',
    value: 'railpack',
    icon: <Hammer size={20} />,
    description: 'Build app using railpack',
  },
  {
    label: 'Dockerfile',
    value: 'dockerfile',
    icon: <Docker fontSize={20} />,
    description: 'Build app using Dockerfile',
  },
  {
    label: 'Buildpacks',
    value: 'buildPacks',
    icon: <Heroku fontSize={20} />,
    description: 'Build app using Herokuish buildpacks',
  },
]
