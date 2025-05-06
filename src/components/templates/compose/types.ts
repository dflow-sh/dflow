import { z } from 'zod'

export const GithubServiceSchema = z.object({
  provider: z.string().optional(),
  providerType: z.enum(['github', 'gitlab', 'bitbucket']).optional(),
  builder: z
    .enum([
      'nixpacks',
      'dockerfile',
      'herokuBuildPacks',
      'buildPacks',
      'railpack',
    ])
    .default('railpack')
    .optional(),
  githubSettings: z
    .object({
      repository: z.string(),
      owner: z.string(),
      branch: z.string(),
      buildPath: z.string(),
      port: z.number().default(3000),
    })
    .optional(),
})

export type GithubServiceType = z.infer<typeof GithubServiceSchema>

export const DockerServiceSchema = z.object({
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
export type DockerServiceType = z.infer<typeof DockerServiceSchema>

export const editServiceNameSchema = (existingNames: string[]) =>
  z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .refine(name => !existingNames.includes(name), {
        message: 'Name already exists',
      }),
    description: z.string().optional().nullable(),
  })

export type EditServiceNameType = z.infer<
  ReturnType<typeof editServiceNameSchema>
>
