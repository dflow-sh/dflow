import SelectSearchComponent from '@/components/SelectSearchComponent'
import { ServerType } from '@/payload-types-overrides'

const Step1 = ({ servers }: { servers: ServerType[] }) => {
  return (
    <>
      <SelectSearchComponent
        buttonLabel={'Select Server'}
        commandInputLabel={'Search Server...'}
        servers={servers}
        commandEmpty={'No such server.'}
      />
    </>
  )
}

export default Step1
