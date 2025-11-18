import { create } from './apps/create'
import { destroy } from './apps/destroy'
import { list as appList } from './apps/list'
import { logs } from './apps/logs'
import { restart } from './apps/restart'
// import { setBuilder } from './builder'  // TODO: Fix export
import { report as buildpackReport } from './buildpacks/report'
// import { setBuildpack } from './buildpacks/set'  // TODO: Fix export
import { clear } from './config/clear'
import { listVars } from './config/listVars'
import { set as setConfig } from './config/set'
import { unset } from './config/unset'
import { info as distroInfo } from './distro/info'
// import { dockerOptions } from './docker/options'  // TODO: Fix export
// import { loginDockerRegistry } from './docker/registry/login'  // TODO: Fix export
import { add } from './domains/add'
import { addGlobal } from './domains/addGlobal'
import { list as domainList } from './domains/list'
import { listGlobal } from './domains/listGlobal'
import { remove } from './domains/remove'
import { removeGlobal } from './domains/removeGlobal'
import { report as domainReport } from './domains/report'
import { set as setDomain } from './domains/set'
import { setGlobal } from './domains/setGlobal'
import { auth } from './git/auth'
import { deployImage } from './git/deployImage'
import { sync } from './git/sync'
import { unlock } from './git/unlock'
// import { authBackup } from './plugin/database/backup/auth'  // TODO: Fix export
import { deleteBackup } from './plugin/database/backup/internal/delete'
// import { exportBackup } from './plugin/database/backup/internal/export'  // TODO: Fix export
// import { importBackup } from './plugin/database/backup/internal/import'  // TODO: Fix export
import { create as createDatabase } from './plugin/database/create'
import { destroy as destroyDatabase } from './plugin/database/destroy'
import { expose } from './plugin/database/expose'
import { info as databaseInfo } from './plugin/database/info'
import { infoVersion } from './plugin/database/infoVersion'
import { link } from './plugin/database/link'
import { links } from './plugin/database/links'
import { list as databaseList } from './plugin/database/list'
import { logs as databaseLogs } from './plugin/database/logs'
import { restart as restartDatabase } from './plugin/database/restart'
import { stop } from './plugin/database/stop'
import { unexpose } from './plugin/database/unexpose'
import { unlink } from './plugin/database/unlink'
import { install } from './plugin/install'
import { installed } from './plugin/installed'
import { addEmail } from './plugin/letsEncrypt/addEmail'
import { addGlobalEmail } from './plugin/letsEncrypt/addGlobalEmail'
// import { cron } from './plugin/letsEncrypt/cron'  // TODO: Fix export
import { enable } from './plugin/letsEncrypt/enable'
import { status } from './plugin/letsEncrypt/status'
import { list as pluginList } from './plugin/list'
import { toggle } from './plugin/toggle'
import { uninstall } from './plugin/uninstall'
// import { add as addPort } from './ports/add'  // TODO: Fix export
// import { list as portList } from './ports/list'  // TODO: Fix export
// import { remove as removePort } from './ports/remove'  // TODO: Fix export
// import { report as portReport } from './ports/report'  // TODO: Fix export
// import { set as setPort } from './ports/set'  // TODO: Fix export
import { rebuild } from './process/rebuild'
// import { resource } from './process/resource'  // TODO: Fix export
import { restart as processRestart } from './process/restart'
import { scale } from './process/scale'
import { start } from './process/start'
import { stop as processStop } from './process/stop'
import { stopAll } from './process/stopAll'
import { info as versionInfo } from './version/info'
import { install as installVersion } from './version/install'
import { uninstall as uninstallVersion } from './version/uninstall'
import { list as volumeList } from './volumes/list'
import { mount } from './volumes/mount'
import { unmount } from './volumes/unmount'

export const dokkuApps = {
  create,
  destroy,
  list: appList,
  logs,
  restart,
}

export const dokkuBuilder = {
  // set: setBuilder,  // TODO: Fix export
}

export const dokkuBuildpacks = {
  report: buildpackReport,
  // set: setBuildpack,  // TODO: Fix export
}

export const dokkuConfig = {
  clear,
  list: listVars,
  set: setConfig,
  unset,
}

export const dokkuDistro = {
  info: distroInfo,
}

export const dokkuDocker = {
  // options: dockerOptions,  // TODO: Fix export
  registry: {
    // login: loginDockerRegistry,  // TODO: Fix export
  },
}

export const dokkuDomains = {
  add,
  addGlobal,
  list: domainList,
  listGlobal,
  remove,
  removeGlobal,
  report: domainReport,
  set: setDomain,
  setGlobal,
}

export const dokkuGit = {
  auth,
  deployImage,
  sync,
  unlock,
}

export const dokkuDatabase = {
  backup: {
    // auth: authBackup,  // TODO: Fix export
    delete: deleteBackup,
    // export: exportBackup,  // TODO: Fix export
    // import: importBackup,  // TODO: Fix export
  },
  create: createDatabase,
  destroy: destroyDatabase,
  expose,
  info: databaseInfo,
  infoVersion,
  link,
  links,
  list: databaseList,
  logs: databaseLogs,
  restart: restartDatabase,
  stop,
  unexpose,
  unlink,
}

export const dokkuPlugin = {
  install,
  installed,
  letsEncrypt: {
    addEmail,
    addGlobalEmail,
    // cron,  // TODO: Fix export
    enable,
    status,
  },
  list: pluginList,
  toggle,
  uninstall,
}

export const dokkuPorts = {
  // add: addPort,  // TODO: Fix export
  // list: portList,  // TODO: Fix export
  // remove: removePort,  // TODO: Fix export
  // report: portReport,  // TODO: Fix export
  // set: setPort,  // TODO: Fix export
}

export const dokkuProcess = {
  rebuild,
  // resource,  // TODO: Fix export
  restart: processRestart,
  scale,
  start,
  stop: processStop,
  stopAll,
}

export const dokkuVersion = {
  info: versionInfo,
  install: installVersion,
  uninstall: uninstallVersion,
}

export const dokkuVolumes = {
  list: volumeList,
  mount,
  unmount,
}

// Export all as default dokku object
export const dokku = {
  apps: dokkuApps,
  builder: dokkuBuilder,
  buildpacks: dokkuBuildpacks,
  config: dokkuConfig,
  distro: dokkuDistro,
  docker: dokkuDocker,
  domains: dokkuDomains,
  git: dokkuGit,
  database: dokkuDatabase,
  plugin: dokkuPlugin,
  ports: dokkuPorts,
  process: dokkuProcess,
  version: dokkuVersion,
  volumes: dokkuVolumes,
}
