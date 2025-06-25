'use client'

import { Edge, Node, OnEdgesChange, OnNodesChange } from '@xyflow/react'
import { ChevronRight, Database, Github, Package2, Plus } from 'lucide-react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import {
  ChangeEvent,
  Ref,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { Docker } from '@/components/icons'
import ReactFlowConfig from '@/components/reactflow/reactflow.config'
import { ServiceNode } from '@/components/reactflow/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useArchitectureContext } from '@/providers/ArchitectureProvider'

import AddDatabaseService from './AddDatabaseService'
import AddDockerService from './AddDockerService'
import AddGithubService from './AddGithubService'
import { VolumeServicesList } from './AddVolumeToService'
import ContextMenu from './ContextMenu'
import ReorderList from './DeploymentOrder'
import UpdateServiceDetails from './UpdateServiceDetails'

interface Menu {
  service: ServiceNode
  top: number
  left: number
}
export type ChildRef = {
  handleOnClick: (args: { serviceId: string }) => void
}
interface ChooseServiceType {
  nodes: Node[]
  edges: Edge[]
  setNodes: Function
  setEdges: Function
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  children?: React.ReactNode
  ref?: Ref<ChildRef>
}

export const getPositionForNewNode = (
  index: number,
): { x: number; y: number } => {
  const baseX = 500
  const baseY = 200

  const spacingX = 320
  const spacingY = 220

  const columns = 3 // max columns per row

  const column = index % columns
  const row = Math.floor(index / columns)

  return {
    x: baseX + column * spacingX,
    y: baseY + row * spacingY,
  }
}

const ChooseService: React.FC<ChooseServiceType> = ({
  edges,
  nodes,
  onEdgesChange,
  onNodesChange,
  setEdges,
  setNodes,
  ref: parentRef,
  children,
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const [showOptions, setShowOptions] = useState<boolean>(false)
  const [showGithub, setShowGithub] = useState<boolean>(false)
  const [showDocker, setShowDocker] = useState<boolean>(false)
  const [showDatabases, setShowDatabases] = useState<boolean>(false)
  const [showVolumeServices, setShowVolumeServices] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const [openDrawer, setOpenDrawer] = useState<boolean>(false)
  const [serviceId, setServiceId] = useState<string>('')
  const ref = useRef(null)
  const [menu, setMenu] = useState<Menu | null>(null)

  const architectureContext = function useSafeArchitectureContext() {
    try {
      return useArchitectureContext()
    } catch (e) {
      return null
    }
  }

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault()

      setMenu({
        service: node.data as unknown as ServiceNode,
        top: event.clientY,
        left: event.clientX,
      })
    },
    [],
  )

  const onPaneClick = useCallback(() => setMenu(null), [setMenu])

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  const handleShowGithubRepoClick = () => {
    setShowOptions(true)
    setShowGithub(true)
  }
  const handleShowDatabaseClick = () => {
    setShowOptions(true)
    setShowDatabases(true)
  }
  const handleShowDockerClick = () => {
    setShowOptions(true)
    setShowDocker(true)
  }
  const handleShowVolumeServicesClick = () => {
    setShowOptions(true)
    setShowVolumeServices(true)
  }
  const resetDialog = () => {
    setSearchQuery('')
    setShowDatabases(false)
    setShowGithub(false)
    setShowDocker(false)
    setShowVolumeServices(false)
    setShowOptions(false)
  }

  const handleOnClick = ({ serviceId }: { serviceId: string }) => {
    setServiceId(serviceId)
    setOpenDrawer(true)
  }

  useImperativeHandle(
    parentRef,
    () => ({
      handleOnClick,
    }),
    [],
  )

  const mainOptions = [
    {
      id: 1,
      text: 'Github Repo',
      icon: <Github className='h-[18px] w-[18px]' />,
      isDisabled: false,
      onClick: handleShowGithubRepoClick,
      chevronRightDisable: true,
    },
    {
      id: 2,
      text: 'Docker Image',
      icon: <Docker className='h-[18px] w-[18px]' />,
      isDisabled: false,
      onClick: handleShowDockerClick,
      chevronRightDisable: true,
    },
    {
      id: 3,
      text: 'Database',
      icon: <Database size={18} stroke='#3fa037' />,
      isDisabled: false,
      onClick: handleShowDatabaseClick,
      chevronRightDisable: false,
    },
    {
      id: 4,
      text: 'Volume',
      icon: <Package2 size={18} />,
      isDisabled:
        nodes.filter(
          node => (node?.data as unknown as ServiceNode)?.type !== 'database',
        )?.length <= 0,
      onClick: handleShowVolumeServicesClick,
      chevronRightDisable:
        nodes.filter(
          node => (node?.data as unknown as ServiceNode)?.type !== 'database',
        )?.length <= 1,
    },
  ]

  const filteredOptions = mainOptions.filter(option =>
    option.text.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <ReactFlowConfig
      nodes={nodes}
      edges={edges}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
      onPaneClick={onPaneClick}
      onNodeContextMenu={onNodeContextMenu}
      className=''>
      <section
        ref={ref}
        className='relative mx-auto h-[calc(100vh-156px)] w-full overflow-y-hidden px-2'>
        <div className='mt-2 flex w-full items-center justify-end gap-x-2'>
          <Button
            className='z-20'
            variant={'outline'}
            disabled={architectureContext()?.isDeploying}
            onClick={() => setOpen(true)}>
            <Plus size={16} /> Add New
          </Button>
        </div>

        {/* service creation */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent onCloseAutoFocus={resetDialog}>
            <DialogHeader>
              <DialogTitle>
                {showOptions && showVolumeServices
                  ? 'Add Volume'
                  : 'Add Service'}
              </DialogTitle>
            </DialogHeader>
            {!showOptions ? (
              <>
                <Input
                  placeholder='Add a service'
                  value={searchQuery}
                  onChange={e => {
                    handleSearchChange(e)
                  }}
                />

                <AnimatePresence mode='wait' initial={false}>
                  <MotionConfig
                    transition={{
                      duration: 0.3,
                      ease: [0.22, 1, 0.36, 1],
                    }}>
                    {!showOptions && (
                      <motion.div
                        key='main-options'
                        initial={{ x: '-75%', opacity: 0.25 }}
                        animate={{ x: 0, opacity: [0.25, 1] }}
                        exit={{ x: '-100%', opacity: 1 }}
                        className='w-full'>
                        <ul className='px-2 py-3 text-left'>
                          {filteredOptions.length === 0 ? (
                            <div>There is no such thing as {searchQuery}</div>
                          ) : (
                            filteredOptions.map(option => (
                              <li
                                key={option.id}
                                className={`flex items-center justify-between rounded-md p-3 text-base hover:bg-card/30 ${
                                  option.isDisabled
                                    ? 'cursor-not-allowed text-muted-foreground'
                                    : 'cursor-pointer hover:text-base focus:bg-card/30'
                                }`}
                                onClick={
                                  !option.isDisabled
                                    ? option.onClick
                                    : undefined
                                }>
                                <div className='flex items-center gap-x-3'>
                                  {option.icon}
                                  <div className='select-none'>
                                    {option.text}
                                  </div>
                                </div>
                                {!option.isDisabled &&
                                  !option.chevronRightDisable && (
                                    <ChevronRight
                                      size={17}
                                      className='justify-end'
                                    />
                                  )}
                              </li>
                            ))
                          )}
                        </ul>
                      </motion.div>
                    )}
                  </MotionConfig>
                </AnimatePresence>
              </>
            ) : showOptions && showDatabases ? (
              <AddDatabaseService
                nodes={nodes}
                setNodes={setNodes}
                setOpen={setOpen}
                handleOnClick={handleOnClick}
              />
            ) : showOptions && showGithub ? (
              <AddGithubService
                type='create'
                setOpen={setOpen}
                nodes={nodes}
                setNodes={setNodes}
                handleOnClick={handleOnClick}
              />
            ) : showOptions && showDocker ? (
              <AddDockerService
                type='create'
                setOpen={setOpen}
                nodes={nodes}
                setNodes={setNodes}
                handleOnClick={handleOnClick}
              />
            ) : showOptions && showVolumeServices ? (
              <VolumeServicesList
                setOpen={setOpen}
                nodes={nodes.filter(
                  node =>
                    (node?.data as unknown as ServiceNode)?.type !== 'database',
                )}
                setNodes={setNodes}
              />
            ) : null}
          </DialogContent>
        </Dialog>

        {nodes?.length > 1 && (
          <div className='absolute right-2 top-24 z-20'>
            <ReorderList nodes={nodes as any} setNodes={setNodes as any} />
          </div>
        )}

        <UpdateServiceDetails
          open={openDrawer}
          setOpen={setOpenDrawer}
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
          service={nodes?.find(node => node?.id === serviceId)?.data as any}
        />
        {menu && (
          <ContextMenu
            nodes={nodes}
            onClick={onPaneClick}
            edges={edges}
            {...menu}
          />
        )}
        {children}
      </section>
    </ReactFlowConfig>
  )
}
export default ChooseService
