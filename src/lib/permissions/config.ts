export const getActionAccess = {
  // Servers actions
  createServerAction: ['servers.create'],
  createTailscaleServerAction: ['servers.create'],
  updateTailscaleServerAction: ['servers.update'],
  updateServerAction: ['servers.update'],
  deleteServerAction: ['servers.delete'],
  installDokkuAction: ['servers.read', 'servers.update'],
  updateServerDomainAction: ['servers.read', 'servers.update'],
  installRailpackAction: ['servers.read', 'servers.update'],
  updateRailpackAction: ['servers.update'],
  completeServerOnboardingAction: ['servers.read', 'servers.update'],
  getServersAction: ['servers.read'],
  checkDNSConfigAction: ['servers.read'],
  syncServerDomainAction: ['servers.read', 'servers.update'],
  checkServerConnection: ['servers.read'],
  configureGlobalBuildDirAction: ['servers.read', 'servers.update'],
  resetOnboardingAction: ['servers.read', 'servers.update'],
  getServersDetailsAction: ['servers.read'],
  getAddServerDetails: ['sshKeys.read', 'securityGroups.read'],
  getServerBreadcrumbs: ['servers.read'],
  getServerProjects: ['projects.read'],
  getServerGeneralTabDetails: [
    'sshKeys.read',
    'projects.read',
    'securityGroups.read',
  ],

  // Plugin actions
  installPluginAction: ['servers.update'],
  syncPluginAction: ['servers.read', 'servers.update'],
  togglePluginStatusAction: ['servers.update'],
  deletePluginAction: ['servers.update'],
  configureLetsencryptPluginAction: ['servers.update'],
  installAndConfigureLetsencryptPluginAction: ['servers.update'],

  // Templates actions
  getTemplateByIdAction: ['templates.read'],
  createTemplateAction: ['templates.create'],
  deleteTemplateAction: ['templates.delete', 'cloudProviderAccounts.read'],
  updateTemplateAction: ['templates.update'],
  getPersonalTemplatesAction: ['templates.read'],
  publishTemplateAction: [
    'templates.update',
    'cloudProviderAccounts.read',
    'templates.read',
  ],

  unPublishTemplateAction: [
    'templates.update',
    'cloudProviderAccounts.read',
    'templates.read',
  ],

  syncWithPublicTemplateAction: [
    'templates.update',
    'cloudProviderAccounts.read',
    'templates.read',
  ],
  templateDeployAction: ['projects.create', 'services.create', 'servers.read'],

  // roles actions
  getRolesAction: ['roles.read'],
  createRoleAction: ['roles.create'],
  updateRolePermissionsAction: ['roles.update'],
  deleteRoleAction: ['roles.delete'],

  // teams actions
  getTeamMembersAction: ['team.read'],
  getTenantAction: ['team.read'],
  updateUserTenantRolesAction: ['team.update'],
  removeUserFromTeamAction: ['team.delete'],
  generateInviteLinkAction: ['team.update'],

  // dFlow cloud actions
  getCloudProvidersAccountsAction: ['cloudProviderAccounts.read'],
  syncDflowServersAction: [
    'servers.read',
    'servers.create',
    'cloudProviderAccounts.read',
  ],
  connectDFlowAccountAction: ['cloudProviderAccounts.create'],
  checkAccountConnection: ['cloudProviderAccounts.read'],
  createVPSOrderAction: [
    'servers.create',
    'cloudProviderAccounts.read',
    'sshKeys.read',
  ],
  checkPaymentMethodAction: ['cloudProviderAccounts.read'],
  deleteDFlowAccountAction: ['cloudProviderAccounts.delete'],
  getDflowUser: ['cloudProviderAccounts.read'],
  updateDFlowAccountAction: ['cloudProviderAccounts.update'],

  // AWS cloud actions
  createEC2InstanceAction: [
    'cloudProviderAccounts.read',
    'sshKeys.read',
    'securityGroups.read',
    'securityGroups.update',
    'servers.create',
  ],
  updateEC2InstanceAction: [
    'servers.read',
    'cloudProviderAccounts.read',
    'securityGroups.read',
    'servers.update',
  ],
  checkAWSAccountConnection: ['servers.read'],
  connectAWSAccountAction: ['cloudProviderAccounts.create'],
  updateAWSAccountAction: ['cloudProviderAccounts.update'],
  deleteAWSAccountAction: ['cloudProviderAccounts.delete'],

  // Git provider actions
  createGithubAppAction: ['gitProviders.create'],
  installGithubAppAction: ['gitProviders.update'],
  deleteGitProviderAction: ['gitProviders.delete'],
  getRepositoriesAction: ['gitProviders.read'],
  getBranchesAction: ['gitProviders.read'],
  getAllAppsAction: ['gitProviders.read'],
  skipOnboardingAction: ['team.update'],

  // Docker registries actions
  getDockerRegistries: ['dockerRegistries.read'],
  testDockerRegistryConnectionAction: ['dockerRegistries.read'],
  connectDockerRegistryAction: ['dockerRegistries.create'],
  updateDockerRegistryAction: ['dockerRegistries.update'],
  deleteDockerRegistryAction: ['dockerRegistries.delete'],

  // sshKeys actions
  createSSHKeyAction: ['sshKeys.create'],
  updateSSHKeyAction: ['sshKeys.update'],
  deleteSSHKeyAction: ['sshKeys.delete'],

  // SecurityGroup actions
  createSecurityGroupAction: ['securityGroups.create'],
  updateSecurityGroupAction: ['securityGroups.update'],
  deleteSecurityGroupAction: ['securityGroups.delete'],
  syncSecurityGroupAction: ['securityGroups.update'],
  getSecurityGroupsAction: ['securityGroups.read'],

  // Projects actions
  createProjectAction: ['servers.read', 'projects.create'],
  updateProjectAction: ['projects.update'],
  deleteProjectAction: ['projects.delete', 'services.delete'],
  getProjectDatabasesAction: ['services.read'],
  getProjectBreadcrumbs: ['projects.read'],

  // Services actions
  getServiceDetails: ['services.read'],
  getServiceDeploymentsBackups: ['services.read', 'backups.read'],
  createServiceAction: ['services.create', 'projects.read', 'services.read'],
  deleteServiceAction: ['services.delete', 'services.read'],
  updateServiceAction: ['services.read', 'services.update'],
  restartServiceAction: ['services.read', 'services.update'],
  stopServerAction: ['services.read', 'services.update'],
  exposeDatabasePortAction: ['services.read', 'services.update'],
  updateServiceDomainAction: ['services.read', 'services.update'],
  regenerateSSLAction: ['services.read', 'services.update'],
  syncServiceDomainAction: ['services.read', 'services.update'],
  updateVolumesAction: ['services.read', 'services.update'],
  scaleServiceAction: ['services.read'],
  fetchServiceScaleStatusAction: ['services.read'],
  setServiceResourceLimitAction: ['services.read'],
  setServiceResourceReserveAction: ['services.read'],
  fetchServiceResourceStatusAction: ['services.read'],
  clearServiceResourceLimitAction: ['services.read'],
  clearServiceResourceReserveAction: ['services.read'],
  checkServerResourcesAction: ['services.read'],

  // combined read access
  getProjectDetails: ['projects.read', 'services.read'],
  getProjectsAndServers: ['servers.read', 'projects.read'],

  getSecurityDetailsAction: [
    'securityGroups.read',
    'servers.read',
    'cloudProviderAccounts.read',
  ],

  getSshKeysAction: ['sshKeys.read', 'servers.read'],

  // tailscale Actions
  getOAuthClientSecretAction: ['servers.read'],
  generateOAuthClientSecretAction: ['servers.read'],

  //  Backup actions
  getAllBackupsAction: ['backups.read'],
  internalBackupAction: ['backups.create', 'services.read'],
  internalRestoreAction: ['backups.read', 'services.read', 'backups.update'],
  internalDbDeleteAction: ['services.read', 'backups.delete', 'backups.read'],

  // Deployment actions
  createDeploymentAction: ['services.read', 'services.update'],

  //install net data
  installNetdataAction: ['servers.read', 'servers.update'],
  uninstallNetdataAction: ['servers.read', 'servers.update'],

  // Terminal Actions
  installTerminalAction: ['servers.read'],
  uninstallTerminalAction: ['servers.read'],
  startTerminalAction: ['servers.read'],
  stopTerminalAction: ['servers.read'],
  restartTerminalAction: ['servers.read'],

  // Beszel Actions
  installMonitoringToolsAction: [
    'servers.read',
    'projects.read',
    'projects.create',
    'services.create',
  ]
} as const

export type GetActionAccessMap = typeof getActionAccess
export type ActionName = keyof GetActionAccessMap
export type ActionPermission = GetActionAccessMap[ActionName][number]
