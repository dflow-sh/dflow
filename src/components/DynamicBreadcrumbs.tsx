'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const disabledLinks = ['project']

export function DynamicBreadcrumbs() {
  const pathname = usePathname()

  // Split the pathname into segments and filter out empty ones
  const segments = pathname.split('/').filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList className='capitalize'>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}`
          const isLast = index === segments.length - 1
          const label = decodeURIComponent(segment.replace(/\+/g, ' '))

          return (
            <Fragment key={href}>
              <BreadcrumbItem>
                {isLast || disabledLinks.includes(segment) ? (
                  <BreadcrumbLink>{label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
