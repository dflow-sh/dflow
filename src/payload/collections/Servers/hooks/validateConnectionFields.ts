import { CollectionBeforeValidateHook, ValidationError } from 'payload'

export const validateConnectionFields: CollectionBeforeValidateHook = async ({
  data,
  req,
}) => {
  const { preferConnectionType } = data || {}

  if (!preferConnectionType) {
    throw new ValidationError({
      errors: [
        {
          message: 'Preferred connection type is required',
          path: 'preferConnectionType',
        },
      ],
    })
  }

  const errors: Array<{ message: string; path: string }> = []

  if (preferConnectionType === 'ssh') {
    // Validate SSH-related fields (all required except hostname)
    if (!data?.name) {
      errors.push({
        message: 'Name is required when SSH is the preferred connection type',
        path: 'name',
      })
    }

    if (!data?.description) {
      errors.push({
        message:
          'Description is required when SSH is the preferred connection type',
        path: 'description',
      })
    }

    if (!data?.sshKey) {
      errors.push({
        message:
          'SSH Key is required when SSH is the preferred connection type',
        path: 'sshKey',
      })
    }

    if (!data?.ip) {
      errors.push({
        message:
          'IP Address is required when SSH is the preferred connection type',
        path: 'ip',
      })
    }

    if (!data?.port) {
      errors.push({
        message:
          'Port Number is required when SSH is the preferred connection type',
        path: 'port',
      })
    }

    if (!data?.username) {
      errors.push({
        message:
          'Username is required when SSH is the preferred connection type',
        path: 'username',
      })
    }
  } else if (preferConnectionType === 'tailscale') {
    // Validate Tailscale-related fields (name, description, hostname, username required initially)
    if (!data?.name) {
      errors.push({
        message:
          'Name is required when Tailscale is the preferred connection type',
        path: 'name',
      })
    }

    if (!data?.description) {
      errors.push({
        message:
          'Description is required when Tailscale is the preferred connection type',
        path: 'description',
      })
    }

    if (!data?.hostname) {
      errors.push({
        message:
          'Hostname is required when Tailscale is the preferred connection type',
        path: 'hostname',
      })
    }

    if (!data?.username) {
      errors.push({
        message:
          'Username is required when Tailscale is the preferred connection type',
        path: 'username',
      })
    }
  }

  if (errors.length > 0) {
    throw new ValidationError({
      errors: errors,
    })
  }

  return data
}
