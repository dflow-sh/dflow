'use client'

import { Edge, Node, OnEdgesChange, OnNodesChange } from '@xyflow/react'
import { ChevronRight, Database, Package2, Plus } from 'lucide-react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import {
  ChangeEvent,
  Ref,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { Docker, Git } from "@core/components/icons"
import ReactFlowConfig from "@core/components/reactflow/reactflow.config"
import { ServiceNode } from "@core/components/reactflow/types"
import { Button } from "@core/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@core/components/ui/dialog"
import { Input } from "@core/components/ui/input"
import { getSessionValue } from "@core/lib/getSessionValue"
import { useArchitectureContext } from "@core/providers/ArchitectureProvider"

import AddDatabaseService from "@core/components/templates/compose/AddDatabaseService"
import AddDockerService from "@core/components/templates/compose/AddDockerService"
import { VolumeServicesList } from "@core/components/templates/compose/AddVolumeToService"
import ContextMenu from "@core/components/templates/compose/ContextMenu"
import ReorderList from "@core/components/templates/compose/DeploymentOrder"
import UpdateServiceDetails from "@core/components/templates/compose/UpdateServiceDetails"
import AppType from "@core/components/templates/compose/git"

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
  const ref = useRef(null)
  const nodeId = getSessionValue('nodeId')
  const availableNodeId = nodeId && nodes?.find(node => node.id === nodeId)?.id
  const [open, setOpen] = useState<boolean>(false)
  const [showOptions, setShowOptions] = useState<boolean>(false)
  const [showApp, setShowApp] = useState<boolean>(false)
  const [showDocker, setShowDocker] = useState<boolean>(false)
  const [showDatabases, setShowDatabases] = useState<boolean>(false)
  const [showVolumeServices, setShowVolumeServices] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [serviceId, setServiceId] = useState<string | null>(
    availableNodeId ?? null,
  )
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
    setShowApp(true)
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
    setShowApp(false)
    setShowDocker(false)
    setShowVolumeServices(false)
    setShowOptions(false)
  }

  const handleOnClick = ({ serviceId }: { serviceId: string }) => {
    setServiceId(serviceId)
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
      text: 'App',
      icon: <Git className='h-[18px] w-[18px]' />,
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
        className='relative mx-auto h-[calc(100vh-180px)] w-full overflow-y-hidden px-2'>
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
          <DialogContent
            onCloseAutoFocus={resetDialog}
            className='sm:max-w-3xl'>
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
                                className={`hover:bg-card/30 flex items-center justify-between rounded-md p-3 text-base ${
                                  option.isDisabled
                                    ? 'text-muted-foreground cursor-not-allowed'
                                    : 'focus:bg-card/30 cursor-pointer hover:text-base'
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
            ) : showOptions && showApp ? (
              <AppType
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
          <div className='absolute top-24 right-2 z-20'>
            <ReorderList nodes={nodes as any} setNodes={setNodes as any} />
          </div>
        )}

        <UpdateServiceDetails
          key={serviceId}
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
          setServiceId={setServiceId}
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
