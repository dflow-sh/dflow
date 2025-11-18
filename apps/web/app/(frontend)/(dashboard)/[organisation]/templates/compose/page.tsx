import LayoutClient from '../../layout.client'

import CreateNewTemplate from '@/components/templates/compose'

const page = () => {
  return (
    <LayoutClient className='min-w-full overflow-hidden !px-0 !py-0'>
      <CreateNewTemplate />
    </LayoutClient>
  )
}

export default page
