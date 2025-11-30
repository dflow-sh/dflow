import { createWettyConfig } from './createWettyConfig'
import { deployWithNginx } from './deployWithNginx'
import { listWettyContainers, stopWettyContainer } from './listWettyContainers'
import { runWettyContainer } from './runWettyContainer'
import { startWettyWithConfig } from './startWettyWithConfig'
import { startWettyWithVolume } from './startWettyWithVolume'

export const wetty = {
  createWettyConfig,
  deployWithNginx,
  listWettyContainers,
  runWettyContainer,
  startWettyWithConfig,
  startWettyWithVolume,
  stopWettyContainer,
}
