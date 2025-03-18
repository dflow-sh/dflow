import { JSX } from 'react'

import { cn } from '@/lib/utils'

export type TimeLineComponentType = {
  icon: JSX.Element
  title: string
  description?: string
  content: JSX.Element
  disabled?: boolean
  highlighted?: boolean
}

export default function TimeLineComponent({
  list,
}: {
  list: TimeLineComponentType[]
}) {
  return (
    <ol className='relative ml-4 text-base transition-colors duration-300'>
      {list.map(
        ({
          icon,
          title,
          content,
          description,
          disabled = false,
          highlighted = false,
        }) => {
          return (
            <li
              key={title}
              className={cn(
                'border-s-2 pb-10 ps-6 last:border-s-0 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
                highlighted && 'border-primary',
              )}
              data-disabled={disabled}>
              <span
                className={cn(
                  'absolute -start-[0.95rem] flex h-8 w-8 items-center justify-center rounded-full bg-border ring-2 ring-border',
                  highlighted && 'bg-primary ring-primary',
                )}>
                {icon}
              </span>

              <div className='ml-2'>
                <h3 className='font-semibold'>{title}</h3>
                <p className='mb-4 text-sm text-muted-foreground'>
                  {description}
                </p>

                {content}
              </div>
            </li>
          )
        },
      )}
    </ol>
  )
}
