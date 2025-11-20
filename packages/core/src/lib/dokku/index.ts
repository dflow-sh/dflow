import { create } from '@/dokku/apps/create'
import { destroy } from '@/lib/dokku/apps/destroy'
import { list as appList } from '@/lib/dokku/apps/list'
import { logs } from '@/lib/dokku/apps/logs'
import { setBuildDir, setGlobalBuildDir } from '@/lib/dokku/builder'
import { report as reportBuildpacks } from '@/lib/dokku/buildpacks/report'
import { set as setBuildpacks } from '@/lib/dokku/buildpacks/set'
import { clear } from '@/lib/dokku/config/clear'
import { listVars } from '@/lib/dokku/config/listVars'
import { set } from '@/lib/dokku/config/set'
import { unset } from '@/lib/dokku/config/unset'
import { info as distroInfo } from '@/lib/dokku/distro/info'
import { options } from '@/lib/dokku/docker/options'
import { login } from '@/lib/dokku/docker/registry/login'
import { add } from '@/lib/dokku/domains/add'
import { addGlobal } from '@/lib/dokku/domains/addGlobal'
import { list as listDomains } from '@/lib/dokku/domains/list'
import { listGlobal as listGlobalDomains } from '@/lib/dokku/domains/listGlobal'
import { remove } from '@/lib/dokku/domains/remove'
import { removeGlobal } from '@/lib/dokku/domains/removeGlobal'
import { report } from '@/lib/dokku/domains/report'
import { set as domainsSet } from '@/lib/dokku/domains/set'
import { setGlobal } from '@/lib/dokku/domains/setGlobal'
import { auth } from '@/lib/dokku/git/auth'
import { deployImage } from '@/lib/dokku/git/deployImage'
import { sync } from '@/lib/dokku/git/sync'
import { unlock } from '@/lib/dokku/git/unlock'
import { auth as DatabaseAuth } from '@/lib/dokku/plugin/database/backup/auth'
import { deleteBackup } from '@/lib/dokku/plugin/database/backup/internal/delete'
import { exportDB } from '@/lib/dokku/plugin/database/backup/internal/export'
import { importDB } from '@/lib/dokku/plugin/database/backup/internal/import'
import { create as createDatabase } from '@/lib/dokku/plugin/database/create'
import { destroy as destroyDb } from '@/lib/dokku/plugin/database/destroy'
import { expose as exposeDatabasePort } from '@/lib/dokku/plugin/database/expose'
import { info } from '@/lib/dokku/plugin/database/info'
import { infoVersion } from '@/lib/dokku/plugin/database/infoVersion'
import { link } from '@/lib/dokku/plugin/database/link'
import { links as databaseLinks } from '@/lib/dokku/plugin/database/links'
import { list as databaseList } from '@/lib/dokku/plugin/database/list'
import { logs as databaseLogs } from '@/lib/dokku/plugin/database/logs'
import { restart as databaseRestart } from '@/lib/dokku/plugin/database/restart'
import { stop as stopDatabase } from '@/lib/dokku/plugin/database/stop'
import { unexpose as unexposeDatabasePort } from '@/lib/dokku/plugin/database/unexpose'
import { unlink } from '@/lib/dokku/plugin/database/unlink'
import { install as dokkuPluginInstall } from '@/lib/dokku/plugin/install'
import { installed } from '@/lib/dokku/plugin/installed'
import { addEmail } from '@/lib/dokku/plugin/letsEncrypt/addEmail'
import { addGlobalEmail } from '@/lib/dokku/plugin/letsEncrypt/addGlobalEmail'
import { addCron } from '@/lib/dokku/plugin/letsEncrypt/cron'
import { enable } from '@/lib/dokku/plugin/letsEncrypt/enable'
import { status as letsencryptStatus } from '@/lib/dokku/plugin/letsEncrypt/status'
import { list } from '@/lib/dokku/plugin/list'
import { toggle } from '@/lib/dokku/plugin/toggle'
import { uninstall as PluginUninstall } from '@/lib/dokku/plugin/uninstall'
import { portsAdd } from '@/lib/dokku/ports/add'
import { portsList } from '@/lib/dokku/ports/list'
import { portsRemove } from '@/lib/dokku/ports/remove'
import { portsReport } from '@/lib/dokku/ports/report'
import { portsSet } from '@/lib/dokku/ports/set'
import { rebuild } from '@/lib/dokku/process/rebuild'
import {
  resourceLimit,
  resourceLimitClear,
  resourceReport,
  resourceReserve,
  resourceReserveClear,
} from '@/lib/dokku/process/resource'
import { restart } from '@/lib/dokku/process/restart'
import { psReport, psScale, scale } from '@/lib/dokku/process/scale'
import { start } from '@/lib/dokku/process/start'
import { stop } from '@/lib/dokku/process/stop'
import { stopAll } from '@/lib/dokku/process/stopAll'
import { report as nginxConfigReport } from '@/lib/dokku/proxy/nginx/report'
import { set as setNginxConfig } from '@/lib/dokku/proxy/nginx/set'
import { info as dokkuVersionInfo } from '@/lib/dokku/version/info'
import { install as dokkuInstall } from '@/lib/dokku/version/install'
import { uninstall as dokkuUninstall } from '@/lib/dokku/version/uninstall'
import { list as volumesList } from '@/lib/dokku/volumes/list'
import { mount } from '@/lib/dokku/volumes/mount'
import { unmount } from '@/lib/dokku/volumes/unmount'

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
