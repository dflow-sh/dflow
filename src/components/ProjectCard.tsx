import Link from 'next/link'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function ProjectCard() {
  return (
    <Link href={'/dashboard/project/1'}>
      <Card className='min-h-36'>
        <CardHeader>
          <CardTitle>Project</CardTitle>
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
