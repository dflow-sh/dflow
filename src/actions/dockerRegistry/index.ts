'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { protectedClient } from '@/lib/safe-action'
import { DockerRegistry } from '@/payload-types'

import {
  connectDockerRegistrySchema,
  deleteDockerRegistrySchema,
  testDockerRegistryConnectionSchema,
  updateDockerRegistrySchema,
} from './validator'

export const getDockerRegistries = protectedClient
  .metadata({
    actionName: 'getDockerRegistries',
  })
  .action(async ({ ctx }) => {
    const payload = await getPayload({ config: configPromise })
    const { userTenant } = ctx
    const { docs } = await payload.find({
      collection: 'dockerRegistries',
      pagination: false,
      where: {
        and: [
          {
            'tenant.slug': {
              equals: userTenant.tenant?.slug,
            },
          },
        ],
      },
    })

    return docs
  })

export const connectDockerRegistryAction = protectedClient
  .metadata({
    actionName: 'connectDockerRegistryAction',
  })
  .schema(connectDockerRegistrySchema)
  .action(async ({ clientInput, ctx }) => {
    const { password, username, type, name } = clientInput
    const payload = await getPayload({ config: configPromise })

    let response: DockerRegistry

    response = await payload.create({
      collection: 'dockerRegistries',
      data: {
        type,
        name,
        username,
        password,
        tenant: ctx.userTenant.tenant,
      },
    })

    return response
  })

export const updateDockerRegistryAction = protectedClient
  .metadata({
    actionName: 'updateDockerRegistryAction',
  })
  .schema(updateDockerRegistrySchema)
  .action(async ({ clientInput, ctx }) => {
    const { password, username, type, name, id } = clientInput
    const payload = await getPayload({ config: configPromise })

    let response: DockerRegistry

    response = await payload.update({
      collection: 'dockerRegistries',
      id,
      data: {
        type,
        name,
        username,
        password,
      },
    })

    return response
  })

export const deleteDockerRegistryAction = protectedClient
  .metadata({
    actionName: 'deleteDockerRegistryAction',
  })
  .schema(deleteDockerRegistrySchema)
  .action(async ({ clientInput }) => {
    const { id } = clientInput
    const payload = await getPayload({ config: configPromise })

    const response = await payload.update({
      collection: 'dockerRegistries',
      id,
      data: {
        deletedAt: new Date().toISOString(),
      },
    })

    return response
  })

export const testDockerRegistryConnectionAction = protectedClient
  .metadata({
    actionName: 'testDockerRegistryConnectionAction',
  })
  .schema(testDockerRegistryConnectionSchema)
  .action(async ({ clientInput }) => {
    const { type, username, password, name } = clientInput

    try {
      // Validate credentials format
      if (!username || typeof username !== 'string' || username.trim() === '') {
        return {
          isConnected: false,
          registryInfo: null,
          error: 'Invalid or missing registry username',
        }
      }

      if (!password || typeof password !== 'string' || password.trim() === '') {
        return {
          isConnected: false,
          registryInfo: null,
          error: 'Invalid or missing registry password/token',
        }
      }

      // Test connection based on registry type
      let connectionResult
      switch (type) {
        case 'docker':
          connectionResult = await testDockerHubConnection(
            username.trim(),
            password.trim(),
          )
          break
        case 'github':
          connectionResult = await testGitHubRegistryConnection(
            username.trim(),
            password.trim(),
          )
          break
        case 'digitalocean':
          connectionResult = await testDigitalOceanRegistryConnection(
            username.trim(),
            password.trim(),
          )
          break
        case 'quay':
          connectionResult = await testQuayRegistryConnection(
            username.trim(),
            password.trim(),
          )
          break
        default:
          return {
            isConnected: false,
            registryInfo: null,
            error: `Unsupported registry type: ${type}`,
          }
      }

      if (connectionResult.isConnected) {
        const registryInfo = {
          name: name || `${type} Registry`,
          type,
          username: username.trim(),
          connectionTime: new Date().toISOString(),
          ...connectionResult.info,
        }

        return {
          isConnected: true,
          registryInfo,
          error: null,
        }
      } else {
        return {
          isConnected: false,
          registryInfo: null,
          error: connectionResult.error,
        }
      }
    } catch (error: any) {
      console.error('Docker registry connection check failed:', error)

      // Handle specific error types
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return {
          isConnected: false,
          registryInfo: null,
          error:
            'Network error. Please check your internet connection and registry URL.',
        }
      }

      if (error.code === 'ECONNABORTED' || error.name === 'TimeoutException') {
        return {
          isConnected: false,
          registryInfo: null,
          error:
            'Connection timeout. The registry service may be slow or unavailable.',
        }
      }

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          isConnected: false,
          registryInfo: null,
          error:
            'Network error. Please check your internet connection and try again.',
        }
      }

      if (
        error.name === 'ThrottlingException' ||
        error.name === 'RequestLimitExceeded'
      ) {
        return {
          isConnected: false,
          registryInfo: null,
          error: 'Too many requests. Please wait a moment and try again.',
        }
      }

      // Generic error fallback
      return {
        isConnected: false,
        registryInfo: null,
        error:
          'Failed to connect to registry. Please check your credentials and try again.',
      }
    }
  })

// Helper functions for testing different registry types
async function testDockerHubConnection(
  username: string,
  password: string,
): Promise<{ isConnected: boolean; error?: string; info?: any }> {
  try {
    // Test Docker Hub authentication
    const response = await fetch(
      'https://auth.docker.io/token?service=registry.docker.io&scope=repository:library/hello-world:pull',
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        },
      },
    )

    if (response.ok) {
      const data = await response.json()
      return {
        isConnected: true,
        info: {
          hasRegistryAccess: true,
          tokenReceived: !!data.token,
        },
      }
    } else if (response.status === 401) {
      return {
        isConnected: false,
        error:
          'Invalid Docker Hub credentials. Please check your username and password.',
      }
    } else if (response.status === 429) {
      return {
        isConnected: false,
        error: 'Too many requests to Docker Hub. Please wait and try again.',
      }
    } else {
      return {
        isConnected: false,
        error: `Docker Hub authentication failed with status: ${response.status}`,
      }
    }
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        isConnected: false,
        error:
          'Network error. Please check your internet connection and try again.',
      }
    }
    return {
      isConnected: false,
      error:
        'Failed to connect to Docker Hub. Please check your internet connection.',
    }
  }
}

async function testGitHubRegistryConnection(
  username: string,
  token: string,
): Promise<{ isConnected: boolean; error?: string; info?: any }> {
  try {
    // Test GitHub Container Registry authentication
    const response = await fetch(`https://api.github.com/user`, {
      method: 'GET',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (response.ok) {
      const userData = await response.json()
      return {
        isConnected: true,
        info: {
          githubUser: userData.login,
          hasPackageAccess: true,
        },
      }
    } else if (response.status === 401) {
      return {
        isConnected: false,
        error: 'Invalid GitHub token. Please check your personal access token.',
      }
    } else if (response.status === 403) {
      return {
        isConnected: false,
        error:
          'GitHub token lacks required permissions. Please check your token scope.',
      }
    } else if (response.status === 429) {
      return {
        isConnected: false,
        error: 'Too many requests to GitHub API. Please wait and try again.',
      }
    } else {
      return {
        isConnected: false,
        error: `GitHub authentication failed with status: ${response.status}`,
      }
    }
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        isConnected: false,
        error:
          'Network error. Please check your internet connection and try again.',
      }
    }
    return {
      isConnected: false,
      error:
        'Failed to connect to GitHub. Please check your internet connection.',
    }
  }
}

async function testDigitalOceanRegistryConnection(
  username: string,
  token: string,
): Promise<{ isConnected: boolean; error?: string; info?: any }> {
  try {
    // Test DigitalOcean Container Registry authentication
    const response = await fetch('https://api.digitalocean.com/v2/registry', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const registryData = await response.json()
      return {
        isConnected: true,
        info: {
          registryName: registryData.registry?.name,
          hasRegistryAccess: true,
        },
      }
    } else if (response.status === 401) {
      return {
        isConnected: false,
        error: 'Invalid DigitalOcean API token. Please check your credentials.',
      }
    } else if (response.status === 429) {
      return {
        isConnected: false,
        error:
          'Too many requests to DigitalOcean API. Please wait and try again.',
      }
    } else {
      return {
        isConnected: false,
        error: `DigitalOcean authentication failed with status: ${response.status}`,
      }
    }
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        isConnected: false,
        error:
          'Network error. Please check your internet connection and try again.',
      }
    }
    return {
      isConnected: false,
      error:
        'Failed to connect to DigitalOcean. Please check your internet connection.',
    }
  }
}

async function testQuayRegistryConnection(
  username: string,
  token: string,
): Promise<{ isConnected: boolean; error?: string; info?: any }> {
  try {
    // Test Quay.io registry authentication
    const response = await fetch('https://quay.io/api/v1/user/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const userData = await response.json()
      return {
        isConnected: true,
        info: {
          quayUser: userData.username,
          hasRegistryAccess: true,
        },
      }
    } else if (response.status === 401) {
      return {
        isConnected: false,
        error:
          'Invalid Quay.io credentials. Please check your username and token.',
      }
    } else if (response.status === 429) {
      return {
        isConnected: false,
        error: 'Too many requests to Quay.io API. Please wait and try again.',
      }
    } else {
      return {
        isConnected: false,
        error: `Quay.io authentication failed with status: ${response.status}`,
      }
    }
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        isConnected: false,
        error:
          'Network error. Please check your internet connection and try again.',
      }
    }
    return {
      isConnected: false,
      error:
        'Failed to connect to Quay.io. Please check your internet connection.',
    }
  }
}
