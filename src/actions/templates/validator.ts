import { z } from 'zod'

export const servicesSchema = z.array(
  z.object({
    type: z.enum(['app', 'database', 'docker']),
    name: z.string(),
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
    databaseDetails: z
      .object({
        type: z.enum(['postgres', 'mongo', 'mysql', 'redis', 'mariadb']),
        exposedPorts: z.string().array().optional(),
      })
      .optional(),

    provider: z.string().optional(),
    providerType: z.enum(['github', 'gitlab', 'bitbucket']).optional(),
    githubSettings: z
      .object({
        repository: z.string(),
        owner: z.string(),
        branch: z.string(),
        buildPath: z.string(),
        port: z.number().default(3000),
      })
      .optional(),
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
    builder: z
      .enum([
        'dockerfile',
        'railpack',
        'buildPacks',
        'herokuBuildPacks',
        'nixpacks',
      ])
      .default('railpack')
      .optional(),
  }),
)

export const createTemplateSchema = z.object({
  name: z
    .string({ message: 'Name is required' })
    .min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  services: servicesSchema,
})

export type CreateTemplateSchemaType = z.infer<typeof createTemplateSchema>

export const DeleteTemplateSchema = z.object({
  id: z.string(),
  accountId: z.string(),
})

export const getPersonalTemplateByIdSchema = z.object({
  id: z.string(),
})

export const deployTemplateSchema = z.object({
  id: z.string(),
  projectId: z.string(),
})

export const UpdateServiceSchema = z.object({
  name: z.string(),
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
  databaseDetails: z
    .object({
      type: z.enum(['postgres', 'mongo', 'mysql', 'redis', 'mariadb']),
    })
    .optional(),

  provider: z.string().optional(),
  providerType: z.enum(['github', 'gitlab', 'bitbucket']).optional(),
  githubSettings: z
    .object({
      repository: z.string(),
      owner: z.string(),
      branch: z.string(),
      buildPath: z.string(),
      port: z.number().default(3000),
    })
    .optional(),
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
})

export type UpdateServiceType = z.infer<typeof UpdateServiceSchema>

export const updateTemplateSchema = z.object({
  id: z.string(),
  name: z
    .string({ message: 'Name is required' })
    .min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  services: servicesSchema,
})

export const deployTemplateFromArchitectureSchema = z.object({
  projectId: z.string(),
  services: servicesSchema,
})

export const getAllTemplatesSchema = z.object({
  type: z.enum(['official', 'personal']),
})

export const deployTemplateWithProjectCreateSchema = z
  .object({
    isCreateNewProject: z.boolean().default(false),
    projectDetails: z
      .object({
        name: z
          .string()
          .min(1, { message: 'Name should be at least 1 character' })
          .max(50, { message: 'Name should be less than 50 characters' }),
        description: z.string().optional(),
        serverId: z.string({ message: 'Server is required' }),
      })
      .optional(),
    projectId: z.string({ message: 'project is required' }).optional(),
    services: servicesSchema,
  })
  .superRefine((data, ctx) => {
    if (data.isCreateNewProject) {
      if (!data.projectDetails) {
        ctx.addIssue({
          path: ['projectDetails'],
          code: z.ZodIssueCode.custom,
          message: 'Project details are required',
        })
      }
    } else {
      if (!data.projectId) {
        ctx.addIssue({
          path: ['projectId'],
          code: z.ZodIssueCode.custom,
          message: 'project is required',
        })
      }
    }
  })

export type DeployTemplateWithProjectCreateType = z.infer<
  typeof deployTemplateWithProjectCreateSchema
>

export const getTemplateByIdSchema = z.object({
  templateId: z.string(),
})

export const publicTemplateSchema = z.object({
  templateId: z.string(),
  accountId: z.string({ message: 'select an account to publish' }),
})
