import LayoutClient from '../../layout.client'

import CreateNewTemplate from '@/components/templates/compose'

const page = () => {
  return (
    <LayoutClient className='mb-0 min-w-full overflow-hidden pt-0'>
      <CreateNewTemplate />
    </LayoutClient>
  )
}

export default page
