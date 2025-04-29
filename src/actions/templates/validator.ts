import { z } from 'zod'

export const createTemplateSchema = z.object({
  name: z.string({ message: 'Name is required' }),
  description: z.string().optional(),
  services: z.array(
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
    }),
  ),
})

export type CreateTemplateSchemaType = z.infer<typeof createTemplateSchema>

export const DeleteTemplateSchema = z.object({
  id: z.string(),
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

export const updateTemplateSchema = createTemplateSchema.extend({
  id: z.string(),
})
