import { ServerType } from '@/payload-types-overrides'

import DomainForm from './DomainForm'

const DomainList = ({ server }: { server: ServerType }) => {
  const addedDomains = server.domains ?? []

  return (
    <div className='space-y-4'>
      <DomainForm server={server} />

      {addedDomains.length ? (
        <ul>
          {addedDomains.map(domain => (
            <li key={domain.domain}>{domain.domain}</li>
          ))}
        </ul>
      ) : (
        <p>No Domains Found!</p>
      )}
    </div>
  )
}

export default DomainList
