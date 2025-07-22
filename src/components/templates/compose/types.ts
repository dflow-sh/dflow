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
    .default('buildPacks')
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

export const volumesSchema = z.object({
  volumes: z
    .array(
      z.object({
        hostPath: z
          .string()
          .min(1, 'Host path is required')
          .refine(val => !val.startsWith('/'), {
            message: 'Host path should not start with "/"',
          }),

        containerPath: z
          .string()
          .min(1, 'Container path is required')
          .refine(val => /^\/.+/.test(val), {
            message: 'Container path must start with "/" followed by text',
          }),

        created: z.boolean().default(false).optional().nullable(),
      }),
    )
    .superRefine((volumes, ctx) => {
      const seen = new Map<string, number[]>()

      volumes.forEach((item, index) => {
        const path = item.hostPath.trim()
        if (seen.has(path)) {
          const indices = seen.get(path)
          if (indices) {
            indices.push(index)
          }
        } else {
          seen.set(path, [index])
        }
      })

      for (const [_, indices] of seen.entries()) {
        if (indices.length > 1) {
          indices.forEach(i => {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Host path must be unique',
              path: [i, 'hostPath'],
            })
          })
        }
      }
    }),
})

export type VolumesType = z.infer<typeof volumesSchema>
