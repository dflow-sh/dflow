import { create } from '@dflow/core/lib/dokku/apps/create'
import { destroy } from '@dflow/core/lib/dokku/apps/destroy'
import { list as appList } from '@dflow/core/lib/dokku/apps/list'
import { logs } from '@dflow/core/lib/dokku/apps/logs'
import { setBuildDir, setGlobalBuildDir } from '@dflow/core/lib/dokku/builder'
import { report as reportBuildpacks } from '@dflow/core/lib/dokku/buildpacks/report'
import { set as setBuildpacks } from '@dflow/core/lib/dokku/buildpacks/set'
import { clear } from '@dflow/core/lib/dokku/config/clear'
import { listVars } from '@dflow/core/lib/dokku/config/listVars'
import { set } from '@dflow/core/lib/dokku/config/set'
import { unset } from '@dflow/core/lib/dokku/config/unset'
import { info as distroInfo } from '@dflow/core/lib/dokku/distro/info'
import { options } from '@dflow/core/lib/dokku/docker/options'
import { login } from '@dflow/core/lib/dokku/docker/registry/login'
import { add } from '@dflow/core/lib/dokku/domains/add'
import { addGlobal } from '@dflow/core/lib/dokku/domains/addGlobal'
import { list as listDomains } from '@dflow/core/lib/dokku/domains/list'
import { listGlobal as listGlobalDomains } from '@dflow/core/lib/dokku/domains/listGlobal'
import { remove } from '@dflow/core/lib/dokku/domains/remove'
import { removeGlobal } from '@dflow/core/lib/dokku/domains/removeGlobal'
import { report } from '@dflow/core/lib/dokku/domains/report'
import { set as domainsSet } from '@dflow/core/lib/dokku/domains/set'
import { setGlobal } from '@dflow/core/lib/dokku/domains/setGlobal'
import { auth } from '@dflow/core/lib/dokku/git/auth'
import { deployImage } from '@dflow/core/lib/dokku/git/deployImage'
import { sync } from '@dflow/core/lib/dokku/git/sync'
import { unlock } from '@dflow/core/lib/dokku/git/unlock'
import { auth as DatabaseAuth } from '@dflow/core/lib/dokku/plugin/database/backup/auth'
import { deleteBackup } from '@dflow/core/lib/dokku/plugin/database/backup/internal/delete'
import { exportDB } from '@dflow/core/lib/dokku/plugin/database/backup/internal/export'
import { importDB } from '@dflow/core/lib/dokku/plugin/database/backup/internal/import'
import { create as createDatabase } from '@dflow/core/lib/dokku/plugin/database/create'
import { destroy as destroyDb } from '@dflow/core/lib/dokku/plugin/database/destroy'
import { expose as exposeDatabasePort } from '@dflow/core/lib/dokku/plugin/database/expose'
import { info } from '@dflow/core/lib/dokku/plugin/database/info'
import { infoVersion } from '@dflow/core/lib/dokku/plugin/database/infoVersion'
import { link } from '@dflow/core/lib/dokku/plugin/database/link'
import { links as databaseLinks } from '@dflow/core/lib/dokku/plugin/database/links'
import { list as databaseList } from '@dflow/core/lib/dokku/plugin/database/list'
import { logs as databaseLogs } from '@dflow/core/lib/dokku/plugin/database/logs'
import { restart as databaseRestart } from '@dflow/core/lib/dokku/plugin/database/restart'
import { stop as stopDatabase } from '@dflow/core/lib/dokku/plugin/database/stop'
import { unexpose as unexposeDatabasePort } from '@dflow/core/lib/dokku/plugin/database/unexpose'
import { unlink } from '@dflow/core/lib/dokku/plugin/database/unlink'
import { install as dokkuPluginInstall } from '@dflow/core/lib/dokku/plugin/install'
import { installed } from '@dflow/core/lib/dokku/plugin/installed'
import { addEmail } from '@dflow/core/lib/dokku/plugin/letsEncrypt/addEmail'
import { addGlobalEmail } from '@dflow/core/lib/dokku/plugin/letsEncrypt/addGlobalEmail'
import { addCron } from '@dflow/core/lib/dokku/plugin/letsEncrypt/cron'
import { enable } from '@dflow/core/lib/dokku/plugin/letsEncrypt/enable'
import { status as letsencryptStatus } from '@dflow/core/lib/dokku/plugin/letsEncrypt/status'
import { list } from '@dflow/core/lib/dokku/plugin/list'
import { toggle } from '@dflow/core/lib/dokku/plugin/toggle'
import { uninstall as PluginUninstall } from '@dflow/core/lib/dokku/plugin/uninstall'
import { portsAdd } from '@dflow/core/lib/dokku/ports/add'
import { portsList } from '@dflow/core/lib/dokku/ports/list'
import { portsRemove } from '@dflow/core/lib/dokku/ports/remove'
import { portsReport } from '@dflow/core/lib/dokku/ports/report'
import { portsSet } from '@dflow/core/lib/dokku/ports/set'
import { rebuild } from '@dflow/core/lib/dokku/process/rebuild'
import {
  resourceLimit,
  resourceLimitClear,
  resourceReport,
  resourceReserve,
  resourceReserveClear,
} from '@dflow/core/lib/dokku/process/resource'
import { restart } from '@dflow/core/lib/dokku/process/restart'
import { psReport, psScale, scale } from '@dflow/core/lib/dokku/process/scale'
import { start } from '@dflow/core/lib/dokku/process/start'
import { stop } from '@dflow/core/lib/dokku/process/stop'
import { stopAll } from '@dflow/core/lib/dokku/process/stopAll'
import { report as nginxConfigReport } from '@dflow/core/lib/dokku/proxy/nginx/report'
import { set as setNginxConfig } from '@dflow/core/lib/dokku/proxy/nginx/set'
import { info as dokkuVersionInfo } from '@dflow/core/lib/dokku/version/info'
import { install as dokkuInstall } from '@dflow/core/lib/dokku/version/install'
import { uninstall as dokkuUninstall } from '@dflow/core/lib/dokku/version/uninstall'
import { list as volumesList } from '@dflow/core/lib/dokku/volumes/list'
import { mount } from '@dflow/core/lib/dokku/volumes/mount'
import { unmount } from '@dflow/core/lib/dokku/volumes/unmount'

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
