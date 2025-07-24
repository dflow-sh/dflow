import { z } from 'zod'

export const createServiceSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Name should be at-least than 1 character' })
      .max(10, { message: 'Name should be less than 10 characters' }),
    description: z.string().optional(),
    type: z.enum(['database', 'app', 'docker']),
    databaseType: z
      .enum(['postgres', 'mongo', 'mysql', 'redis', 'mariadb'])
      .optional(),
    projectId: z.string(),
    cpuLimit: z.string().optional(),
    memoryLimit: z.string().optional(),
  })
  .refine(data => data.type !== 'database' || !!data.databaseType, {
    message: 'Please select a database type',
    path: ['databaseType'],
  })

export const deleteServiceSchema = z.object({
  id: z.string(),
  deleteBackups: z.boolean().optional(),
  deleteFromServer: z.boolean(),
})

const gitSettings = z
  .object({
    repository: z.string(),
    branch: z.string(),
    gitToken: z.string().optional(),
    owner: z.string(),
    buildPath: z.string(),
    port: z.number().default(3000),
  })
  .optional()

export const updateServiceSchema = z
  .object({
    builder: z
      .enum([
        'nixpacks',
        'dockerfile',
        'herokuBuildPacks',
        'buildPacks',
        'railpack',
      ])
      .optional(),
    provider: z.string().optional(),
    providerType: z
      .enum(['github', 'gitlab', 'bitbucket', 'azureDevOps', 'gitea'])
      .optional(),
    githubSettings: gitSettings,
    azureSettings: gitSettings,
    giteaSettings: gitSettings,
    gitlabSettings: gitSettings,
    bitbucketSettings: gitSettings,
    environmentVariables: z.record(z.string(), z.unknown()).optional(),
    noRestart: z.boolean().optional(),
    id: z.string(),
    project: z.string().optional(),
    dockerDetails: z
      .object({
        url: z.string(),
        account: z.string().optional(),
        ports: z
          .array(
            z.object({
              hostPort: z.number(),
              containerPort: z.number(),
              scheme: z.enum(['http', 'https']),
            }),
          )
          .optional(),
      })
      .optional(),
    variables: z
      .object({
        key: z
          .string()
          .min(1, 'Key must be at-least 1 character')
          .regex(
            /^[a-zA-Z_][a-zA-Z0-9_]*$/,
            'Invalid key format, special-characters & spaces are restricted',
          ),
        value: z.string().min(1, 'Value must be at-least 1 character'),
      })
      .array()
      .optional(),
  })
  .refine(
    data =>
      data.providerType === 'azureDevOps' ? data.azureSettings?.gitToken : true,
    {
      message: 'Git Token is required',
      path: ['azureSettings', 'gitToken'],
    },
  )

export const exposeDatabasePortSchema = z.object({
  id: z.string(),
  action: z.enum(['expose', 'unexpose']),
})

export const updateServiceDomainSchema = z.object({
  domain: z.object({
    hostname: z.string(),
    autoRegenerateSSL: z.boolean(),
    certificateType: z.enum(['letsencrypt', 'none']),
    default: z.boolean().default(false).optional(),
  }),
  operation: z.enum(['add', 'remove', 'set']),
  id: z.string(),
})

export const regenerateSSLSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
})

export const restartServiceSchema = z.object({
  id: z.string(),
})

export const stopServiceSchema = z.object({
  id: z.string(),
})

export const updateVolumesSchema = z.object({
  id: z.string(),
  volumes: z
    .object({
      hostPath: z.string().min(1, 'Host path must be at-least 1 character'),
      containerPath: z
        .string()
        .min(1, 'Container path must be at-least 1 character'),
    })
    .array()
    .optional(),
})

export const scaleServiceSchema = z.object({
  id: z.string(),
  scaleArgs: z
    .array(z.string())
    .min(1, 'At least one scale argument is required'), // e.g. ["web=2", "worker=1"]
})

export const fetchServiceScaleStatusSchema = z.object({
  id: z.string(),
  parse: z.boolean().optional(), // allow parse control
})

export const setServiceResourceLimitSchema = z.object({
  id: z.string(),
  resourceArgs: z
    .array(z.string())
    .min(1, 'At least one resource argument is required'), // e.g. ["--cpu 100", "--memory 100"]
  processType: z.string().optional(),
})

export const setServiceResourceReserveSchema = z.object({
  id: z.string(),
  resourceArgs: z
    .array(z.string())
    .min(1, 'At least one resource argument is required'),
  processType: z.string().optional(),
})

export const fetchServiceResourceStatusSchema = z.object({
  id: z.string(),
})

export const clearServiceResourceLimitSchema = z.object({
  id: z.string(),
  processType: z.string().optional(),
})

export const clearServiceResourceReserveSchema = z.object({
  id: z.string(),
  processType: z.string().optional(),
})

export const checkServerResourcesSchema = z.object({
  serverId: z.string(),
  serviceType: z.enum(['app', 'docker', 'database']).optional(),
})
