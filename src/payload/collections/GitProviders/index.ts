import { CollectionConfig } from 'payload'

export const GitProviders: CollectionConfig = {
  slug: 'gitProviders',
  labels: {
    singular: 'Git Provider',
    plural: 'Git Providers',
  },
  access: {
    create: () => true,
    read: () => true,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      label: 'Name',
      required: true,
      options: [
        {
          label: 'Github',
          value: 'github',
        },
        {
          label: 'Gitlab',
          value: 'gitlab',
        },
        {
          label: 'Bitbucket',
          value: 'bitbucket',
        },
      ],
    },
    {
      name: 'github',
      type: 'group',
      label: 'Github',
      admin: {
        condition: data => {
          if (data.type === 'github') {
            return true
          }

          return false
        },
      },
      fields: [
        {
          name: 'appName',
          type: 'text',
          required: true,
        },
        {
          name: 'appId',
          type: 'text',
          required: true,
        },
        {
          name: 'clientId',
          type: 'text',
          required: true,
        },
        {
          name: 'clientSecret',
          type: 'text',
          required: true,
        },
        {
          name: 'installationId',
          type: 'text',
          required: true,
        },
        {
          name: 'privateKey',
          type: 'text',
          required: true,
        },
        {
          name: 'webhookSecret',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}

// gitlabUrl: text("gitlabUrl").default("https://gitlab.com").notNull(),
// 	applicationId: text("application_id"),
// 	redirectUri: text("redirect_uri"),
// 	secret: text("secret"),
// 	accessToken: text("access_token"),
// 	refreshToken: text("refresh_token"),
// 	groupName: text("group_name"),
// 	expiresAt: integer("expires_at"),

// bitbucketUsername: text("bitbucketUsername"),
// 	appPassword: text("appPassword"),
// 	bitbucketWorkspaceName: text("bitbucketWorkspaceName"),
