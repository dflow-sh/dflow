import { Node } from '@xyflow/react'

import {
  Bitbucket,
  GitLab,
  Gitea,
  Github,
  MicrosoftAzure,
} from '@/components/icons'
import { ServiceNode } from '@/components/reactflow/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import AddAzureDevopsService from './AddAzureDevopsService'
import AddBitbucketService from './AddBitbucketService'
import AddGiteaService from './AddGiteaService'
import AddGithubService from './AddGithubService'
import AddGitlabService from './AddGitlabService'

const AppType = ({
  setNodes,
  nodes,
  type = 'create',
  setOpen,
  handleOnClick,
  service,
}: {
  setNodes: Function
  nodes: Node[]
  service?: ServiceNode
  setOpen?: Function
  type: 'create' | 'update'
  handleOnClick?: ({ serviceId }: { serviceId: string }) => void
}) => {
  return (
    <Tabs defaultValue={'github'}>
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
        <AddGithubService
          setNodes={setNodes}
          nodes={nodes}
          type={type}
          setOpen={setOpen}
          handleOnClick={handleOnClick}
          service={service}
        />
      </TabsContent>
      <TabsContent value='azureDevOps'>
        <AddAzureDevopsService
          setNodes={setNodes}
          nodes={nodes}
          type={type}
          setOpen={setOpen}
          handleOnClick={handleOnClick}
          service={service}
        />
      </TabsContent>
      <TabsContent value='gitea'>
        <AddGiteaService
          setNodes={setNodes}
          nodes={nodes}
          type={type}
          setOpen={setOpen}
          handleOnClick={handleOnClick}
          service={service}
        />
      </TabsContent>
      <TabsContent value='gitlab'>
        <AddGitlabService
          setNodes={setNodes}
          nodes={nodes}
          type={type}
          setOpen={setOpen}
          handleOnClick={handleOnClick}
          service={service}
        />
      </TabsContent>
      <TabsContent value='bitbucket'>
        <AddBitbucketService
          setNodes={setNodes}
          nodes={nodes}
          type={type}
          setOpen={setOpen}
          handleOnClick={handleOnClick}
          service={service}
        />
      </TabsContent>
    </Tabs>
  )
}

export default AppType
