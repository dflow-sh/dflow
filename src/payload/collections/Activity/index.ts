import type { CollectionConfig } from 'payload'

export const Activity: CollectionConfig = {
  slug: 'activity',
  labels: {
    singular: 'Activity',
    plural: 'Activities',
  },
  admin: {
    useAsTitle: 'eventType',
    defaultColumns: [
      'eventType',
      'operation',
      'user',
      'collectionSlug',
      'createdAt',
    ],
    group: 'System',
    description: 'Track all user activities and system events',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role?.includes('admin')) return true

      return { user: { equals: user.id } }
    },
    create: ({ req: { user } }) => !!user,
    update: () => false,
    delete: ({ req: { user } }) => !!user?.role?.includes('admin'),
  },
  fields: [
    // === TAB 1: Event Information ===
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Event',
          fields: [
            {
              name: 'eventType',
              type: 'text',
              required: true,
              index: true,
              admin: {
                description:
                  'Type of event (e.g., account_created, server_onboarded)',
              },
            },
            {
              name: 'operation',
              type: 'text',
              required: true,
              index: true,
              admin: {
                description:
                  'CRUD operation: create, read, update, delete, login, logout',
              },
            },
            {
              name: 'status',
              type: 'text',
              required: true,
              defaultValue: 'success',
              index: true,
              admin: {
                description: 'Event status: success, failed, pending',
              },
            },
            {
              name: 'severity',
              type: 'text',
              defaultValue: 'info',
              index: true,
              admin: {
                description: 'Event severity: info, warning, error, critical',
              },
            },
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: {
                description: 'Human-readable event label',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description: 'Detailed description of what happened',
              },
            },
            {
              name: 'icon',
              type: 'text',
              admin: {
                description: 'Lucide icon name for UI display',
              },
            },
            {
              name: 'category',
              type: 'text',
              index: true,
              admin: {
                description:
                  'Event category for grouping (auth, server, deployment, etc.)',
              },
            },
          ],
        },

        // === TAB 2: User Information ===
        {
          label: 'User',
          fields: [
            {
              name: 'user',
              type: 'relationship',
              relationTo: 'users',
              required: true,
              index: true,
              admin: {
                description: 'User who performed the action',
              },
            },
            {
              name: 'userEmail',
              type: 'email',
              admin: {
                description: 'Cached user email for quick reference',
              },
            },
            {
              name: 'userRole',
              type: 'text',
              admin: {
                description: 'User role at time of action',
              },
            },
            {
              name: 'sessionId',
              type: 'text',
              index: true,
              admin: {
                description: 'Session identifier for tracking user sessions',
              },
            },
          ],
        },

        // === TAB 3: Resource Information ===
        {
          label: 'Resource',
          fields: [
            {
              name: 'collectionSlug',
              type: 'text',
              index: true,
              admin: {
                description: 'Target collection slug (if applicable)',
              },
            },
            {
              name: 'documentId',
              type: 'text',
              index: true,
              admin: {
                description: 'ID of affected document',
              },
            },
            {
              name: 'documentTitle',
              type: 'text',
              admin: {
                description: 'Title/name of affected document for display',
              },
            },
            {
              name: 'changes',
              type: 'json',
              admin: {
                description: 'Before/after values of changed fields',
              },
            },
            {
              name: 'changedFields',
              type: 'array',
              admin: {
                description: 'List of field names that were modified',
              },
              fields: [
                {
                  name: 'field',
                  type: 'text',
                },
              ],
            },
          ],
        },

        // === TAB 4: Request Information ===
        {
          label: 'Request',
          fields: [
            {
              name: 'ipAddress',
              type: 'text',
              index: true,
              admin: {
                readOnly: true,
                description: 'IP address of the request',
              },
            },
            {
              name: 'userAgent',
              type: 'text',
              admin: {
                readOnly: true,
                description: 'User agent string',
              },
            },
            {
              name: 'requestMethod',
              type: 'text',
              admin: {
                description: 'HTTP method (GET, POST, PUT, DELETE)',
              },
            },
            {
              name: 'requestUrl',
              type: 'text',
              admin: {
                description: 'Request URL path',
              },
            },
            {
              name: 'requestHeaders',
              type: 'json',
              admin: {
                description: 'Important request headers',
              },
            },
            {
              name: 'duration',
              type: 'number',
              admin: {
                description: 'Operation duration in milliseconds',
              },
            },
          ],
        },

        // === TAB 5: Location & Session ===
        {
          label: 'Location',
          fields: [
            {
              name: 'location',
              type: 'group',
              admin: {
                description: 'Geographic location data (if available)',
              },
              fields: [
                {
                  name: 'country',
                  type: 'text',
                },
                {
                  name: 'city',
                  type: 'text',
                },
                {
                  name: 'region',
                  type: 'text',
                },
                {
                  name: 'timezone',
                  type: 'text',
                },
              ],
            },
          ],
        },

        // === TAB 6: Error Information ===
        {
          label: 'Error',
          admin: {
            condition: data => data.status === 'failed',
          },
          fields: [
            {
              name: 'error',
              type: 'group',
              admin: {
                condition: data => data.status === 'failed',
              },
              fields: [
                {
                  name: 'message',
                  type: 'textarea',
                },
                {
                  name: 'stack',
                  type: 'textarea',
                  admin: {
                    description: 'Error stack trace',
                  },
                },
                {
                  name: 'code',
                  type: 'text',
                },
              ],
            },
          ],
        },

        // === TAB 7: Metadata & Flags ===
        {
          label: 'Metadata',
          fields: [
            {
              name: 'metadata',
              type: 'json',
              admin: {
                description: 'Flexible storage for event-specific data',
              },
            },
            {
              name: 'isSystemEvent',
              type: 'checkbox',
              defaultValue: false,
              index: true,
              admin: {
                description:
                  'Whether this was triggered by system vs user action',
              },
            },
            {
              name: 'isSensitive',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Mark sensitive events for special handling',
              },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
