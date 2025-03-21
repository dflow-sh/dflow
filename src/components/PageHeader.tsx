import { JSX } from 'react'

import { DynamicBreadcrumbs } from './DynamicBreadcrumbs'

const PageHeader = ({
  title,
  description,
  action,
}: {
  title: string | JSX.Element
  description?: string
  action?: JSX.Element
}) => {
  return (
    <div className='mb-4'>
      <DynamicBreadcrumbs items={[]} />

      <div className='flex w-full justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{title}</h1>
          <p className='text-muted-foreground'>{description}</p>
        </div>

        {action}
      </div>
    </div>
  )
}

export default PageHeader
