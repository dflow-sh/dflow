import { Bitbucket, GitLab, Gitea, Github, MicrosoftAzure } from '../icons'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GitProvider, Service } from '@/payload-types'

import AzureDevopsForm from './git/AzureDevopsForm'
import BitbucketForm from './git/BitbucketForm'
import GiteaForm from './git/GiteaForm'
import GithubForm from './git/GithubForm'
import GitlabForm from './git/GitlabForm'

const ProviderForm = ({
  gitProviders,
  service,
}: {
  gitProviders: GitProvider[]
  service: Service
}) => {
  const { providerType } = service

  return (
    <div className='space-y-4 rounded bg-muted/30 p-4'>
      <div>
        <h3 className='text-lg font-semibold'>Provider</h3>
        <p className='text-muted-foreground'>Select the source of your code</p>
      </div>

      <Tabs defaultValue={providerType ?? 'github'}>
        <div
          className='w-full overflow-y-hidden overflow-x-scroll'
          style={{ scrollbarWidth: 'none' }}>
          <TabsList className='mb-4 grid w-max grid-cols-5'>
            <TabsTrigger value='github' className='flex gap-1.5'>
              <Github className='size-4' />
              Github
            </TabsTrigger>

            <TabsTrigger value='azureDevOps' className='flex gap-1.5'>
              <MicrosoftAzure className='size-4' />
              Azure DevOps
            </TabsTrigger>

            <TabsTrigger value='gitea' className='flex'>
              <div className='relative mr-2 size-4'>
                <Gitea className='absolute -left-1 -top-1 size-6' />
              </div>
              Gitea
            </TabsTrigger>

            <TabsTrigger value='gitlab' className='flex gap-1.5'>
              <GitLab className='size-4' />
              Gitlab
            </TabsTrigger>

            <TabsTrigger value='bitbucket' className='flex gap-1.5'>
              <Bitbucket className='size-4' />
              Bitbucket
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='github'>
          <GithubForm gitProviders={gitProviders} service={service} />
        </TabsContent>

        <TabsContent value='azureDevOps'>
          <AzureDevopsForm service={service} />
        </TabsContent>

        <TabsContent value='gitea'>
          <GiteaForm service={service} />
        </TabsContent>

        <TabsContent value='gitlab'>
          <GitlabForm service={service} />
        </TabsContent>

        <TabsContent value='bitbucket'>
          <BitbucketForm service={service} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProviderForm
