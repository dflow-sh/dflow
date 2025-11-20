import { create } from '@/dokku/apps/create'
import { destroy } from '@dflow/shared/dokku/apps/destroy'
import { list as appList } from '@dflow/shared/dokku/apps/list'
import { logs } from '@dflow/shared/dokku/apps/logs'
import { setBuildDir, setGlobalBuildDir } from '@dflow/shared/dokku/builder'
import { report as reportBuildpacks } from '@dflow/shared/dokku/buildpacks/report'
import { set as setBuildpacks } from '@dflow/shared/dokku/buildpacks/set'
import { clear } from '@dflow/shared/dokku/config/clear'
import { listVars } from '@dflow/shared/dokku/config/listVars'
import { set } from '@dflow/shared/dokku/config/set'
import { unset } from '@dflow/shared/dokku/config/unset'
import { info as distroInfo } from '@dflow/shared/dokku/distro/info'
import { options } from '@dflow/shared/dokku/docker/options'
import { login } from '@dflow/shared/dokku/docker/registry/login'
import { add } from '@dflow/shared/dokku/domains/add'
import { addGlobal } from '@dflow/shared/dokku/domains/addGlobal'
import { list as listDomains } from '@dflow/shared/dokku/domains/list'
import { listGlobal as listGlobalDomains } from '@dflow/shared/dokku/domains/listGlobal'
import { remove } from '@dflow/shared/dokku/domains/remove'
import { removeGlobal } from '@dflow/shared/dokku/domains/removeGlobal'
import { report } from '@dflow/shared/dokku/domains/report'
import { set as domainsSet } from '@dflow/shared/dokku/domains/set'
import { setGlobal } from '@dflow/shared/dokku/domains/setGlobal'
import { auth } from '@dflow/shared/dokku/git/auth'
import { deployImage } from '@dflow/shared/dokku/git/deployImage'
import { sync } from '@dflow/shared/dokku/git/sync'
import { unlock } from '@dflow/shared/dokku/git/unlock'
import { auth as DatabaseAuth } from '@dflow/shared/dokku/plugin/database/backup/auth'
import { deleteBackup } from '@dflow/shared/dokku/plugin/database/backup/internal/delete'
import { exportDB } from '@dflow/shared/dokku/plugin/database/backup/internal/export'
import { importDB } from '@dflow/shared/dokku/plugin/database/backup/internal/import'
import { create as createDatabase } from '@dflow/shared/dokku/plugin/database/create'
import { destroy as destroyDb } from '@dflow/shared/dokku/plugin/database/destroy'
import { expose as exposeDatabasePort } from '@dflow/shared/dokku/plugin/database/expose'
import { info } from '@dflow/shared/dokku/plugin/database/info'
import { infoVersion } from '@dflow/shared/dokku/plugin/database/infoVersion'
import { link } from '@dflow/shared/dokku/plugin/database/link'
import { links as databaseLinks } from '@dflow/shared/dokku/plugin/database/links'
import { list as databaseList } from '@dflow/shared/dokku/plugin/database/list'
import { logs as databaseLogs } from '@dflow/shared/dokku/plugin/database/logs'
import { restart as databaseRestart } from '@dflow/shared/dokku/plugin/database/restart'
import { stop as stopDatabase } from '@dflow/shared/dokku/plugin/database/stop'
import { unexpose as unexposeDatabasePort } from '@dflow/shared/dokku/plugin/database/unexpose'
import { unlink } from '@dflow/shared/dokku/plugin/database/unlink'
import { install as dokkuPluginInstall } from '@dflow/shared/dokku/plugin/install'
import { installed } from '@dflow/shared/dokku/plugin/installed'
import { addEmail } from '@dflow/shared/dokku/plugin/letsEncrypt/addEmail'
import { addGlobalEmail } from '@dflow/shared/dokku/plugin/letsEncrypt/addGlobalEmail'
import { addCron } from '@dflow/shared/dokku/plugin/letsEncrypt/cron'
import { enable } from '@dflow/shared/dokku/plugin/letsEncrypt/enable'
import { status as letsencryptStatus } from '@dflow/shared/dokku/plugin/letsEncrypt/status'
import { list } from '@dflow/shared/dokku/plugin/list'
import { toggle } from '@dflow/shared/dokku/plugin/toggle'
import { uninstall as PluginUninstall } from '@dflow/shared/dokku/plugin/uninstall'
import { portsAdd } from '@dflow/shared/dokku/ports/add'
import { portsList } from '@dflow/shared/dokku/ports/list'
import { portsRemove } from '@dflow/shared/dokku/ports/remove'
import { portsReport } from '@dflow/shared/dokku/ports/report'
import { portsSet } from '@dflow/shared/dokku/ports/set'
import { rebuild } from '@dflow/shared/dokku/process/rebuild'
import {
  resourceLimit,
  resourceLimitClear,
  resourceReport,
  resourceReserve,
  resourceReserveClear,
} from '@dflow/shared/dokku/process/resource'
import { restart } from '@dflow/shared/dokku/process/restart'
import { psReport, psScale, scale } from '@dflow/shared/dokku/process/scale'
import { start } from '@dflow/shared/dokku/process/start'
import { stop } from '@dflow/shared/dokku/process/stop'
import { stopAll } from '@dflow/shared/dokku/process/stopAll'
import { info as dokkuVersionInfo } from '@dflow/shared/dokku/version/info'
import { install as dokkuInstall } from '@dflow/shared/dokku/version/install'
import { uninstall as dokkuUninstall } from '@dflow/shared/dokku/version/uninstall'
import { list as volumesList } from '@dflow/shared/dokku/volumes/list'
import { mount } from '@dflow/shared/dokku/volumes/mount'
import { unmount } from '@dflow/shared/dokku/volumes/unmount'

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
    stopAll,
    scale,
    psReport,
    psScale,
  },
  resource: {
    limit: resourceLimit,
    reserve: resourceReserve,
    limitClear: resourceLimitClear,
    reserveClear: resourceReserveClear,
    report: resourceReport,
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
    uninstall: dokkuUninstall,
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
  buildpacks: {
    set: setBuildpacks,
    report: reportBuildpacks,
  },
}
