import { CircleCheck } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useState } from 'react'

import { installRailpackAction } from '@/actions/server'
import Loader from '@/components/Loader'
import { ServerType } from '@/payload-types-overrides'

import { useDokkuInstallationStep } from './DokkuInstallationStepContext'

const Step4 = ({ server }: { server: ServerType }) => {
  const { dokkuInstallationStep, setDokkuInstallationStep } =
    useDokkuInstallationStep()
  const [skipRailpackInstall, setSkipRailpackInstall] = useState(false)
  const { execute, isPending, hasSucceeded } = useAction(installRailpackAction)

  const railpackVersion = server?.railpack

  useEffect(() => {
    if (dokkuInstallationStep === 4) {
      // 1. Check if railpack installed or not if installed skip to next dokkuInstallationStep
      if (railpackVersion && railpackVersion !== 'not-installed') {
        setSkipRailpackInstall(true)
        setDokkuInstallationStep(5)
      } else {
        // 2. If not installed deploy a queue for railpack installation
        execute({ serverId: server.id })
      }
    }
  }, [dokkuInstallationStep, server])

  return (
    <div className='space-y-2'>
      {skipRailpackInstall && (
        <div className='flex items-center gap-2'>
          <CircleCheck size={24} className='text-primary' />
          Builder installed
        </div>
      )}

      {(isPending || hasSucceeded) &&
        (!railpackVersion || railpackVersion === 'not-installed') && (
          <div className='flex items-center gap-2'>
            <Loader className='h-max w-max' /> Installing Builder...
          </div>
        )}
    </div>
  )
}

export default Step4
