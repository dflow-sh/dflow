import { Alert } from './ui/alert'

const AccessDeniedAlert = ({ error }: { error: string }) => {
  return <Alert variant={'destructive'}> {error}</Alert>
}

export default AccessDeniedAlert
