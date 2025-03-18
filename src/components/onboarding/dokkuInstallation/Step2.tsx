import { SquareTerminal } from 'lucide-react'

import Terminal from '@/components/Terminal'

const Step2 = () => {
  return (
    <div>
      <p className='inline-flex items-center gap-1'>
        <SquareTerminal size={16} />
        Terminal
      </p>
      <Terminal isLoading={false} />
    </div>
  )
}

export default Step2
