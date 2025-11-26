import { createImage } from "@core/lib/server/docker/createImage"
import { deleteImages } from "@core/lib/server/docker/deleteImages"
import { echo } from "@core/lib/server/echo"
import { createWorkspace } from "@core/lib/server/git/createWorkspace"
import { deleteWorkspace } from "@core/lib/server/git/deleteWorkspace"
import { serverInfo } from "@core/lib/server/info"
import { available as portsAvailability } from "@core/lib/server/ports/available"
import { status } from "@core/lib/server/ports/status"
import { infoRailpack } from "@core/lib/server/railpack/info"
import { installRailpack } from "@core/lib/server/railpack/install"
import { uninstallRailpack } from "@core/lib/server/railpack/uninstall"

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
