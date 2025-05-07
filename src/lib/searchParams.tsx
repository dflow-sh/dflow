import { createLoader, parseAsString, parseAsStringEnum } from 'nuqs/server'

// Describe your search params, and reuse this in useQueryStates / createSerializer:
export const onboardingSelectedServer = {
  server: parseAsString.withDefault(''),
}

export const servicePageTabs = {
  tab: parseAsStringEnum([
    'general',
    'environment',
    'logs',
    'domains',
    'deployments',
    'backup',
  ]).withDefault('general'),
}

export const serverPageTabs = {
  tab: parseAsStringEnum([
    'general',
    'monitoring',
    'plugins',
    'domains',
  ]).withDefault('general'),
}

export const serviceLogs = {
  serviceId: parseAsString.withDefault(''),
  serverId: parseAsString.withDefault(''),
}

export const loadOnboardingSelectedServer = createLoader(
  onboardingSelectedServer,
)
export const loadServicePageTabs = createLoader(servicePageTabs)
export const loadServerPageTabs = createLoader(serverPageTabs)
export const loadServiceLogs = createLoader(serviceLogs)
