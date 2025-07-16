import ActionPlaceholder from '../ActionPlaceholder'
import { Kubernetes } from '../icons'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

const KubernetesTab = () => {
  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1.5'>
            <Kubernetes className='size-6' />
            <h4 className='text-lg font-semibold'>Kubernetes</h4>
          </div>

          <Button disabled>Make as master node</Button>
        </div>
      </div>

      <ActionPlaceholder
        icon={<Kubernetes />}
        title='Setup your kubernetes'
        description='Attach your worker nodes and deploy your services using control-plane'
        action={
          <Button disabled>
            <Plus />
            Attach worker node
          </Button>
        }
      />
    </div>
  )
}

export default KubernetesTab
