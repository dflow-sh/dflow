import { createImage } from './docker/createImage'
import { createWorkspace } from './git/createWorkspace'
import { deleteWorkspace } from './git/deleteWorkspace'
import { serverInfo } from './info'
import { available as portsAvailability } from './ports/available'
import { infoRailpack } from './railpack/info'
import { installRailpack } from './railpack/install'

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
  railpack: {
    install: installRailpack,
    info: infoRailpack,
  },
  info: serverInfo,
}
