import { checkInstalled } from './core/checkInstalled'
import { checkPortStatus } from './core/checkPortStatus'
import { disable } from './core/disable'
import { disableApi } from './core/disableApi'
import { enable } from './core/enable'
import { enableApi } from './core/enableApi'
import { install } from './core/install'
import { uninstall } from './core/uninstall'

export const netdata = {
  core: {
    checkInstalled,
    install,
    uninstall,
    disable,
    enable,
    enableApi,
    disableApi,
    checkPortStatus,
  },
}
