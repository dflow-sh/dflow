import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { useAction } from 'next-safe-action/hooks'
import { useParams, useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { getServerProjects } from '@/actions/pages/server'
import { updateServiceAction } from '@/actions/service'
import { Server, Service } from '@/payload-types'

interface SwitchProjectForm {
  projectId: string
}

const SwitchServiceProjectDialog = ({
  open,
  setOpen,
  service,
  project,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  service: Service & { displayName?: string }
  project: { id: string; name: string; server: string | Server }
}) => {
  const params = useParams<{ organisation: string }>()
  const router = useRouter()
  const form = useForm<SwitchProjectForm>({
    defaultValues: { projectId: '' },
  })

  const {
    execute: fetchProjects,
    isPending: isLoadingProjects,
    result: projectsResult,
  } = useAction(getServerProjects, {
    onError: ({ error }) => {
      toast.error(`Failed to load projects: ${error.serverError}`)
    },
  })

  const {
    execute: switchProject,
    isPending: isSwitching,
    hasSucceeded: isSuccess,
  } = useAction(updateServiceAction, {
    onSuccess: () => {
      setOpen(false)
      toast.success('Service switched to another project')
      router.push(
        `/${params.organisation}/dashboard/project/${form.getValues('projectId')}`,
      )
    },
    onError: ({ error }) => {
      toast.error(`Failed to switch project: ${error.serverError}`)
    },
  })

  useEffect(() => {
    if (open) {
      fetchProjects({
        id:
          typeof project.server === 'object'
            ? project.server.id
            : project.server,
      })
      form.reset({ projectId: '' })
    }
  }, [open])

  const handleSwitch = (values: SwitchProjectForm) => {
    if (!values.projectId) return

    switchProject({
      id: service.id,
      project: values.projectId,
    })
  }

  const projects =
    projectsResult?.data?.projects?.filter((p: any) => p.id !== project.id) ||
    []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Switch Service Project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSwitch)}
            className='space-y-6'>
            <FormField
              control={form.control}
              name='projectId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoadingProjects || isSuccess}>
                      <SelectTrigger id='switch-project-select'>
                        <SelectValue placeholder='Select project' />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                variant='outline'
                type='button'
                onClick={() => setOpen(false)}
                disabled={isSwitching}>
                Cancel
              </Button>
              <Button
                variant='default'
                type='submit'
                disabled={!form.watch('projectId') || isSwitching}
                isLoading={isSwitching}>
                Switch
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default SwitchServiceProjectDialog
