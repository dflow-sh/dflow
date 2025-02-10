import Link from 'next/link'
import { Fragment } from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

import { Separator } from './ui/separator'
import { SidebarTrigger } from './ui/sidebar'

type BreadcrumbItemType = {
  label: string
  href?: string
}

export function DynamicBreadcrumbs({ items }: { items: BreadcrumbItemType[] }) {
  return (
    <header className='mb-4 flex shrink-0 items-center gap-2 transition-[width,height] ease-linear'>
      <div className='flex items-center gap-2'>
        <SidebarTrigger className='-ml-1' />

        {items.length ? (
          <Separator orientation='vertical' className='mr-2 h-4' />
        ) : null}

        <Breadcrumb>
          <BreadcrumbList>
            {items.map(({ label, href }, index) => {
              return (
                <Fragment key={label}>
                  <BreadcrumbItem>
                    {href ? (
                      <Link className='hover:text-foreground' href={href}>
                        {label}
                      </Link>
                    ) : (
                      label
                    )}
                  </BreadcrumbItem>

                  {!(items.length === index + 1) && <BreadcrumbSeparator />}
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
