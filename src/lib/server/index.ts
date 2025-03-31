import { createImage } from './docker/createImage'
import { createWorkspace } from './git/createWorkspace'
import { deleteWorkspace } from './git/deleteWorkspace'
import { available as portsAvailability } from './ports/available'

export const server = {
  ports: {
    available: portsAvailability,
  },
  git: {
    createWorkspace,
    deleteWorkspace,
  },
  docker: {
    createImage,
  },
}
