import { createLoader, parseAsString, parseAsStringEnum } from 'nuqs/server'

// Describe your search params, and reuse this in useQueryStates / createSerializer:
export const onboardingSelectedServer = {
  server: parseAsString.withDefault(''),
}

export const projectPageTabs = {
  tab: parseAsStringEnum(['general', 'settings']).withDefault('general'),
}

export const servicePageTabs = {
  tab: parseAsStringEnum([
    'general',
    'environment',
    'logs',
    'domains',
    'deployments',
    'scaling',
    'backup',
    'volumes',
    'settings',
  ]).withDefault('general'),
}

export const serverPageTabs = {
  tab: parseAsStringEnum([
    'general',
    'plugins',
    'domains',
    'monitoring',
    'settings',
    'kubernetes',
  ]).withDefault('general'),
}

export const serviceLogs = {
  serviceId: parseAsString.withDefault(''),
  serverId: parseAsString.withDefault(''),
}

export const loadOnboardingSelectedServer = createLoader(
  onboardingSelectedServer,
)
export const loadProjectPageTabs = createLoader(projectPageTabs)
export const loadServicePageTabs = createLoader(servicePageTabs)
export const loadServerPageTabs = createLoader(serverPageTabs)
export const loadServiceLogs = createLoader(serviceLogs)
