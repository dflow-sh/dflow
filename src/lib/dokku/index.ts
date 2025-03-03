import { create } from './apps/create'
import { destroy } from './apps/destroy'
import { list as appList } from './apps/list'
import { logs } from './apps/logs'
import { listVars } from './config/listVars'
import { set } from './config/set'
import { unset } from './config/unset'
import { info as distroInfo } from './distro/info'
import { add } from './domains/add'
import { remove } from './domains/remove'
import { report } from './domains/report'
import { set as domainsSet } from './domains/set'
import { auth } from './git/auth'
import { sync } from './git/sync'
import { unlock } from './git/unlock'
import { create as createDatabase } from './plugin/database/create'
import { destroy as destroyDb } from './plugin/database/destroy'
import { info } from './plugin/database/info'
import { infoVersion } from './plugin/database/infoVersion'
import { link } from './plugin/database/link'
import { links as databaseLinks } from './plugin/database/links'
import { list as databaseList } from './plugin/database/list'
import { logs as databaseLogs } from './plugin/database/logs'
import { restart as databaseRestart } from './plugin/database/restart'
import { stop as stopDatabase } from './plugin/database/stop'
import { unlink } from './plugin/database/unlink'
import { install as dokkuPluginInstall } from './plugin/install'
import { installed } from './plugin/installed'
import { enable } from './plugin/letsEncrypt/enable'
import { list } from './plugin/list'
import { toggle } from './plugin/toggle'
import { uninstall as PluginUninstall } from './plugin/uninstall'
import { portsAdd } from './ports/add'
import { portsList } from './ports/list'
import { portsRemove } from './ports/remove'
import { portsSet } from './ports/set'
import { restart } from './process/restart'
import { info as dokkuVersionInfo } from './version/info'
import { install as dokkuInstall } from './version/install'

export const dokku = {
  apps: { create, logs, destroy, list: appList },
  plugin: {
    installed,
    list,
    toggle,
    install: dokkuPluginInstall,
    uninstall: PluginUninstall,
  },
  config: { listVars, set, unset },
  database: {
    destroy: destroyDb,
    info,
    infoVersion,
    logs: databaseLogs,
    list: databaseList,
    listLinks: databaseLinks,
    create: createDatabase,
    link,
    unlink,
    restart: databaseRestart,
    stop: stopDatabase,
  },
  ports: {
    list: portsList,
    set: portsSet,
    add: portsAdd,
    remove: portsRemove,
  },
  process: {
    restart,
  },
  domains: {
    report,
    set: domainsSet,
    remove,
    add,
  },
  letsencrypt: {
    enable,
  },
  git: {
    sync,
    unlock,
    auth,
  },
  version: {
    info: dokkuVersionInfo,
    install: dokkuInstall,
  },
  distro: {
    info: distroInfo,
  },
}
