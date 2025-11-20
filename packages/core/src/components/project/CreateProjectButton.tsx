'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import CreateProject from '@/components/project/CreateProject'
import { Button } from '@/components/ui/button'

const CreateProjectButton = ({ servers }: { servers: any[] }) => {
  // Temporary fix: avoid nested <button> issue with DialogTrigger
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Old code kept for reference:
        <CreateProject servers={servers}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} />
              Create Project
            </Button>
          </DialogTrigger>
        </CreateProject>
      */}

      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        Create Project
      </Button>

      <CreateProject
        servers={servers}
        manualOpen={open}
        setManualOpen={setOpen}
      />
    </>
  )
}

export default CreateProjectButton
