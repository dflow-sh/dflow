import { createWettyConfig } from "@core/lib/wetty/createWettyConfig"
import { deployWithNginx } from "@core/lib/wetty/deployWithNginx"
import { listWettyContainers, stopWettyContainer } from "@core/lib/wetty/listWettyContainers"
import { runWettyContainer } from "@core/lib/wetty/runWettyContainer"
import { startWettyWithConfig } from "@core/lib/wetty/startWettyWithConfig"
import { startWettyWithVolume } from "@core/lib/wetty/startWettyWithVolume"

export const wetty = {
  createWettyConfig,
  deployWithNginx,
  listWettyContainers,
  runWettyContainer,
  startWettyWithConfig,
  startWettyWithVolume,
  stopWettyContainer,
}
