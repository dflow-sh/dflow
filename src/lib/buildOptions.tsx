import Image from 'next/image'

import { Docker, Heroku } from '@/components/icons'
import { Badge } from '@/components/ui/badge'

export const buildOptions = [
  {
    label: (
      <div className='flex items-center gap-2'>
        BuildPacks
        <Badge variant='secondary' className='py-0 text-xs'>
          Default
        </Badge>
      </div>
    ),
    value: 'buildPacks',
    icon: <Heroku width={18} height={18} />,
    description: 'Build app using buildpacks',
  },
  {
    label: 'Dockerfile',
    value: 'dockerfile',
    icon: <Docker fontSize={20} />,
    description: 'Build app using Dockerfile',
  },
  {
    label: 'Railpack',
    value: 'railpack',
    icon: (
      <Image
        src={'/images/railpack.png'}
        alt='railpack'
        width={32}
        height={32}
      />
    ),
    description: 'Build app using railpack',
  },
]
