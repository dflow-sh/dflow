import { Button } from '../ui/button'

const DatabaseBackup = () => {
  return (
    <div className='flex justify-between px-2'>
      <div className='text-2xl font-bold'>Database Backup</div>
      <Button variant={'default'}>Create Backup</Button>
    </div>
  )
}

export default DatabaseBackup
