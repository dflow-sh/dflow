'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const HighLightedLink = ({ href, label }: { label: string; href: string }) => {
  const pathname = usePathname()

  return (
    <Link
      href={href}
      className={`block hover:underline ${
        pathname === href
          ? 'font-semibold text-primary'
          : 'text-muted-foreground'
      }`}>
      {label}
    </Link>
  )
}

export default HighLightedLink
