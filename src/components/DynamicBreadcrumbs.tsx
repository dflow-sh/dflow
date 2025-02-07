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
    <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />

        <Breadcrumb>
          <BreadcrumbList>
            {items.map(({ label, href }, index) => {
              return (
                <Fragment key={label}>
                  <BreadcrumbItem>
                    {href ? <Link href={href}>{label}</Link> : label}
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
