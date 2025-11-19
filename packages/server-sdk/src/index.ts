import { createImage } from './docker/createImage'
import { deleteImages } from './docker/deleteImages'
import { echo } from './echo'
import { createWorkspace } from './git/createWorkspace'
import { deleteWorkspace } from './git/deleteWorkspace'
import { serverInfo } from './info'
import { available as portsAvailability } from './ports/available'
import { status } from './ports/status'
import { infoRailpack } from './railpack/info'
import { installRailpack } from './railpack/install'
import { uninstallRailpack } from './railpack/uninstall'

export const server = {
  ports: {
    available: portsAvailability,
    status,
  },
  git: {
    createWorkspace,
    deleteWorkspace,
  },
  docker: {
    createImage,
    deleteImages,
  },
  railpack: {
    install: installRailpack,
    info: infoRailpack,
    uninstall: uninstallRailpack,
  },
  info: serverInfo,
  echo,
}
