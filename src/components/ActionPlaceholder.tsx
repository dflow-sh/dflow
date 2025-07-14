import { JSX } from 'react'

const ActionPlaceholder = ({
  action,
  icon,
  title = '',
  description = '',
}: {
  action?: JSX.Element
  icon?: JSX.Element
  title?: string
  description?: string
}) => {
  return (
    <div className='rounded-2xl border bg-muted/10 p-8 text-center shadow-sm'>
      <div className='grid min-h-[40vh] place-items-center'>
        <div>
          <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted [&>svg]:size-8 [&>svg]:animate-pulse [&>svg]:text-muted-foreground'>
            {icon}
          </div>

          <div className='my-4'>
            <h3 className='text-xl font-semibold text-foreground'>{title}</h3>
            <p className='text-base text-muted-foreground'>{description}</p>
          </div>

          {action}
        </div>
      </div>
    </div>
  )
}

export default ActionPlaceholder
