import { create } from '@/dokku/apps/create'

import { destroy } from './apps/destroy'
import { list as appList } from './apps/list'
import { logs } from './apps/logs'
import { setBuildDir, setGlobalBuildDir } from './builder'
import { clear } from './config/clear'
import { listVars } from './config/listVars'
import { set } from './config/set'
import { unset } from './config/unset'
import { info as distroInfo } from './distro/info'
import { options } from './docker/options'
import { login } from './docker/registry/login'
import { add } from './domains/add'
import { addGlobal } from './domains/addGlobal'
import { list as listDomains } from './domains/list'
import { listGlobal as listGlobalDomains } from './domains/listGlobal'
import { remove } from './domains/remove'
import { removeGlobal } from './domains/removeGlobal'
import { report } from './domains/report'
import { set as domainsSet } from './domains/set'
import { setGlobal } from './domains/setGlobal'
import { auth } from './git/auth'
import { deployImage } from './git/deployImage'
import { sync } from './git/sync'
import { unlock } from './git/unlock'
import { auth as DatabaseAuth } from './plugin/database/backup/auth'
import { deleteBackup } from './plugin/database/backup/internal/delete'
import { exportDB } from './plugin/database/backup/internal/export'
import { importDB } from './plugin/database/backup/internal/import'
import { create as createDatabase } from './plugin/database/create'
import { destroy as destroyDb } from './plugin/database/destroy'
import { expose as exposeDatabasePort } from './plugin/database/expose'
import { info } from './plugin/database/info'
import { infoVersion } from './plugin/database/infoVersion'
import { link } from './plugin/database/link'
import { links as databaseLinks } from './plugin/database/links'
import { list as databaseList } from './plugin/database/list'
import { logs as databaseLogs } from './plugin/database/logs'
import { restart as databaseRestart } from './plugin/database/restart'
import { stop as stopDatabase } from './plugin/database/stop'
import { unexpose as unexposeDatabasePort } from './plugin/database/unexpose'
import { unlink } from './plugin/database/unlink'
import { install as dokkuPluginInstall } from './plugin/install'
import { installed } from './plugin/installed'
import { addEmail } from './plugin/letsEncrypt/addEmail'
import { addGlobalEmail } from './plugin/letsEncrypt/addGlobalEmail'
import { addCron } from './plugin/letsEncrypt/cron'
import { enable } from './plugin/letsEncrypt/enable'
import { status as letsencryptStatus } from './plugin/letsEncrypt/status'
import { list } from './plugin/list'
import { toggle } from './plugin/toggle'
import { uninstall as PluginUninstall } from './plugin/uninstall'
import { portsAdd } from './ports/add'
import { portsList } from './ports/list'
import { portsRemove } from './ports/remove'
import { portsReport } from './ports/report'
import { portsSet } from './ports/set'
import { rebuild } from './process/rebuild'
import { restart } from './process/restart'
import { start } from './process/start'
import { stop } from './process/stop'
import { info as dokkuVersionInfo } from './version/info'
import { install as dokkuInstall } from './version/install'
import { list as volumesList } from './volumes/list'
import { mount } from './volumes/mount'
import { unmount } from './volumes/unmount'

export const dokku = {
  apps: { create, logs, destroy, list: appList },
  plugin: {
    installed,
    list,
    toggle,
    install: dokkuPluginInstall,
    uninstall: PluginUninstall,
  },
  config: { listVars, set, unset, clear },
  docker: {
    options,
    registry: {
      login,
    },
  },
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
    expose: exposeDatabasePort,
    unexpose: unexposeDatabasePort,
    backup: {
      auth: DatabaseAuth,
    },
    internal: {
      export: exportDB,
      import: importDB,
      delete: deleteBackup,
    },
  },
  ports: {
    list: portsList,
    set: portsSet,
    add: portsAdd,
    remove: portsRemove,
    report: portsReport,
  },
  process: {
    start,
    restart,
    stop,
    rebuild,
  },
  domains: {
    report,
    set: domainsSet,
    remove,
    add,
    addGlobal,
    removeGlobal,
    setGlobal,
    listGlobal: listGlobalDomains,
    list: listDomains,
  },
  letsencrypt: {
    addGlobalEmail: addGlobalEmail,
    addEmail,
    cron: addCron,
    enable,
    status: letsencryptStatus,
  },
  git: {
    sync,
    unlock,
    auth,
    deployImage,
  },
  version: {
    info: dokkuVersionInfo,
    install: dokkuInstall,
  },
  distro: {
    info: distroInfo,
  },
  volumes: {
    list: volumesList,
    mount: mount,
    unmount: unmount,
  },
  builder: {
    setBuildDir,
    setGlobalBuildDir,
  },
}
