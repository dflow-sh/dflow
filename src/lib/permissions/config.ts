export const getActionAccess = {
  createProjectAction: ['projects.create'],
  readServerAction: ['Servers.read'],
  updateServiceAction: ['services.update'],

  // Templates actions
  getTemplates: ['templates.read'],
  getTemplateById: ['templates.read'],
  createTemplate: ['templates.create'],
  deleteTemplate: ['templates.delete'],
  updateTemplate: ['templates.update'],
  getAllTemplatesAction: ['templates.read'],
  publishTemplateAction: ['templates.update'],
  unPublishTemplateAction: ['templates.update'],
  syncWithPublicTemplateAction: ['templates.update'],
  templateDeployAction: ['projects.create', 'service.create'],

  // roles actions
  getRolesAction: ['roles.read'],
  createRoleAction: ['roles.create'],
  updateRolePermissionsAction: ['roles.update'],
  deleteRoleAction: ['roles.delete'],

  // teams actions
  getTeamMembersAction: ['team.read'],
  updateUserTenantRoles: ['team.update'],
  removeUserFromTeamAction: ['team.delete'],

  // dFlow cloud actions
  getCloudProvidersAccountsAction: ['cloudProviderAccounts.read'],
  syncDflowServersAction: [
    'servers.read',
    'servers.create',
    'cloudProviderAccounts.read',
  ],
  connectDFlowAccountAction: ['cloudProviderAccounts.create'],
  checkAccountConnection: ['cloudProviderAccounts.read'],
  createVPSOrderAction: ['servers.created', 'cloudProviderAccounts.read'],
  checkPaymentMethodAction: ['cloudProviderAccounts.read'],
  deleteDFlowAccountAction: ['cloudProviderAccounts.delete'],
  getDflowUser: ['cloudProviderAccounts.read'],
  updateDFlowAccountAction: ['cloudProviderAccounts.update'],

  // AWS cloud actions
  createEC2InstanceAction: [
    'cloudProviderAccounts.read',
    'sshKeys.read',
    'securityGroups.read',
    'servers.create',
  ],
  updateEC2InstanceAction: [
    'servers.read',
    'cloudProviderAccounts.read',
    'securityGroups.read',
    'securityGroups.create',
    'servers.update',
  ],
  checkAWSAccountConnection: ['servers.read', 'cloudProviderAccounts.read'],
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

  // combined read access
  getProjectDetails: ['projects.read', 'services.read'],
  getProjectsAndServers: ['servers.read', 'projects.read'],
  getSecurityDetails: [
    'sshKeys.read',
    'securityGroups.read',
    'servers.read',
    'cloudProviderAccounts.read',
  ],
} as const

export type GetActionAccessMap = typeof getActionAccess
export type ActionName = keyof GetActionAccessMap
export type ActionPermission = GetActionAccessMap[ActionName][number]
