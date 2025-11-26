import CreateNewTemplate from '@dflow/core/components/templates/compose'
import LayoutClient from '../../layout.client'

const page = () => {
  return (
    <LayoutClient className='min-w-full overflow-hidden !px-0 !py-0'>
      <CreateNewTemplate />
    </LayoutClient>
  )
}

export default page
