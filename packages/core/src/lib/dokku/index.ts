import { create } from '@core/lib/dokku/apps/create'
import { destroy } from '@core/lib/dokku/apps/destroy'
import { list as appList } from '@core/lib/dokku/apps/list'
import { logs } from '@core/lib/dokku/apps/logs'
import { setBuildDir, setGlobalBuildDir } from '@core/lib/dokku/builder'
import { report as reportBuildpacks } from '@core/lib/dokku/buildpacks/report'
import { set as setBuildpacks } from '@core/lib/dokku/buildpacks/set'
import { clear } from '@core/lib/dokku/config/clear'
import { listVars } from '@core/lib/dokku/config/listVars'
import { set } from '@core/lib/dokku/config/set'
import { unset } from '@core/lib/dokku/config/unset'
import { info as distroInfo } from '@core/lib/dokku/distro/info'
import { options } from '@core/lib/dokku/docker/options'
import { login } from '@core/lib/dokku/docker/registry/login'
import { add } from '@core/lib/dokku/domains/add'
import { addGlobal } from '@core/lib/dokku/domains/addGlobal'
import { list as listDomains } from '@core/lib/dokku/domains/list'
import { listGlobal as listGlobalDomains } from '@core/lib/dokku/domains/listGlobal'
import { remove } from '@core/lib/dokku/domains/remove'
import { removeGlobal } from '@core/lib/dokku/domains/removeGlobal'
import { report } from '@core/lib/dokku/domains/report'
import { set as domainsSet } from '@core/lib/dokku/domains/set'
import { setGlobal } from '@core/lib/dokku/domains/setGlobal'
import { auth } from '@core/lib/dokku/git/auth'
import { deployImage } from '@core/lib/dokku/git/deployImage'
import { sync } from '@core/lib/dokku/git/sync'
import { unlock } from '@core/lib/dokku/git/unlock'
import { auth as DatabaseAuth } from '@core/lib/dokku/plugin/database/backup/auth'
import { deleteBackup } from '@core/lib/dokku/plugin/database/backup/internal/delete'
import { exportDB } from '@core/lib/dokku/plugin/database/backup/internal/export'
import { importDB } from '@core/lib/dokku/plugin/database/backup/internal/import'
import { create as createDatabase } from '@core/lib/dokku/plugin/database/create'
import { destroy as destroyDb } from '@core/lib/dokku/plugin/database/destroy'
import { expose as exposeDatabasePort } from '@core/lib/dokku/plugin/database/expose'
import { info } from '@core/lib/dokku/plugin/database/info'
import { infoVersion } from '@core/lib/dokku/plugin/database/infoVersion'
import { link } from '@core/lib/dokku/plugin/database/link'
import { links as databaseLinks } from '@core/lib/dokku/plugin/database/links'
import { list as databaseList } from '@core/lib/dokku/plugin/database/list'
import { logs as databaseLogs } from '@core/lib/dokku/plugin/database/logs'
import { restart as databaseRestart } from '@core/lib/dokku/plugin/database/restart'
import { stop as stopDatabase } from '@core/lib/dokku/plugin/database/stop'
import { unexpose as unexposeDatabasePort } from '@core/lib/dokku/plugin/database/unexpose'
import { unlink } from '@core/lib/dokku/plugin/database/unlink'
import { install as dokkuPluginInstall } from '@core/lib/dokku/plugin/install'
import { installed } from '@core/lib/dokku/plugin/installed'
import { addEmail } from '@core/lib/dokku/plugin/letsEncrypt/addEmail'
import { addGlobalEmail } from '@core/lib/dokku/plugin/letsEncrypt/addGlobalEmail'
import { addCron } from '@core/lib/dokku/plugin/letsEncrypt/cron'
import { enable } from '@core/lib/dokku/plugin/letsEncrypt/enable'
import { status as letsencryptStatus } from '@core/lib/dokku/plugin/letsEncrypt/status'
import { list } from '@core/lib/dokku/plugin/list'
import { toggle } from '@core/lib/dokku/plugin/toggle'
import { uninstall as PluginUninstall } from '@core/lib/dokku/plugin/uninstall'
import { portsAdd } from '@core/lib/dokku/ports/add'
import { portsList } from '@core/lib/dokku/ports/list'
import { portsRemove } from '@core/lib/dokku/ports/remove'
import { portsReport } from '@core/lib/dokku/ports/report'
import { portsSet } from '@core/lib/dokku/ports/set'
import { rebuild } from '@core/lib/dokku/process/rebuild'
import {
  resourceLimit,
  resourceLimitClear,
  resourceReport,
  resourceReserve,
  resourceReserveClear,
} from '@core/lib/dokku/process/resource'
import { restart } from '@core/lib/dokku/process/restart'
import { psReport, psScale, scale } from '@core/lib/dokku/process/scale'
import { start } from '@core/lib/dokku/process/start'
import { stop } from '@core/lib/dokku/process/stop'
import { stopAll } from '@core/lib/dokku/process/stopAll'
import { report as nginxConfigReport } from '@core/lib/dokku/proxy/nginx/report'
import { set as setNginxConfig } from '@core/lib/dokku/proxy/nginx/set'
import { info as dokkuVersionInfo } from '@core/lib/dokku/version/info'
import { install as dokkuInstall } from '@core/lib/dokku/version/install'
import { uninstall as dokkuUninstall } from '@core/lib/dokku/version/uninstall'
import { list as volumesList } from '@core/lib/dokku/volumes/list'
import { mount } from '@core/lib/dokku/volumes/mount'
import { unmount } from '@core/lib/dokku/volumes/unmount'

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
  proxy: {
    nginx: {
      report: nginxConfigReport,
      set: setNginxConfig,
    },
  },
}
