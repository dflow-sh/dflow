import { JSX } from 'react'

type TimeLineComponentType = {
  icon: JSX.Element
  title: string
  description?: string
  content: JSX.Element
  disabled?: boolean
}

export default function TimeLineComponent({
  list,
}: {
  list: TimeLineComponentType[]
}) {
  return (
    <ol className='relative ml-4 text-base'>
      {list.map(({ icon, title, content, description, disabled = false }) => {
        return (
          <li
            key={title}
            className='border-s-2 pb-10 ps-6 last:border-s-0 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50'
            data-disabled={disabled}>
            <span className='absolute -start-[0.95rem] flex h-8 w-8 items-center justify-center rounded-full bg-border ring-2 ring-border'>
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
      })}
    </ol>
  )
}
