import { cn } from '@/lib/utils'

import { Alert } from './ui/alert'

const AccessDeniedAlert = ({
  error,
  className,
}: {
  error: string
  className?: string
}) => {
  return (
    <Alert className={cn(className)} variant={'destructive'}>
      {error}
    </Alert>
  )
}

export default AccessDeniedAlert
