import { Field } from 'payload'
import { z } from 'zod'

const validateURL = z
  .string({
    required_error: 'URL is required',
  })
  .url({
    message: 'Please enter a valid URL',
  })

const fontValidation = (
  value: string | string[] | null | undefined,
): true | string => {
  // Ensure value is a string, as it can also be an array or null/undefined
  if (typeof value === 'string') {
    const { success } = validateURL.safeParse(value)
    return success || 'Google Font URL is invalid'
  }
  return 'Google Font URL is invalid'
}

const fontConfig = ({
  remoteFont,
  fontName,
}: {
  remoteFont: string
  fontName: string
}): Field[] => [
  {
    name: 'customFont',
    label: 'Custom Font',
    type: 'upload',
    relationTo: 'media',
    admin: {
      width: '50%',
      condition: (_data, siblingData) => {
        return siblingData.type === 'customFont'
      },
    },
  },
  {
    name: 'remoteFont',
    type: 'text',
    required: true,
    label: 'Google Font URL',
    admin: {
      width: '50%',
      condition: (_data, siblingData) => {
        return siblingData.type === 'googleFont'
      },
    },
    defaultValue: remoteFont,
    validate: fontValidation,
  },
  {
    name: 'fontName',
    type: 'text',
    required: true,
    label: 'Font Name',
    admin: {
      width: '50%',
      condition: (_data, siblingData) => {
        return siblingData.type === 'googleFont'
      },
    },
    defaultValue: fontName,
  },
]

export const themeFields: Field[] = [
  // Colors
  {
    type: 'row',
    fields: [
      {
        name: 'overrideTheme',
        type: 'checkbox',
        required: true,
        defaultValue: false,
        admin: {
          description: 'Check to override default-theme',
        },
      },
    ],
  },
  {
    type: 'row',
    fields: [
      {
        type: 'group',
        name: 'lightMode',
        fields: [
          // background
          {
            type: 'text',
            name: 'background',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#ffffff',
          },
          // foreground
          {
            type: 'text',
            name: 'foreground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#0a0a0a',
          },
          // card
          {
            type: 'text',
            name: 'card',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#ffffff',
          },
          // cardForeground
          {
            type: 'text',
            name: 'cardForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#0a0a0a',
          },
          // popover
          {
            type: 'text',
            name: 'popover',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#ffffff',
          },
          // popoverForeground
          {
            type: 'text',
            name: 'popoverForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#0a0a0a',
          },
          // primary
          {
            type: 'text',
            name: 'primary',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#9372f7',
          },
          // primaryForeground
          {
            type: 'text',
            name: 'primaryForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#f1f5f9',
          },
          // secondary
          {
            type: 'text',
            name: 'secondary',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#e2e8f0',
          },
          // secondaryForeground
          {
            type: 'text',
            name: 'secondaryForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#1e293b',
          },
          // muted
          {
            type: 'text',
            name: 'muted',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#e2e8f0',
          },
          // mutedForeground
          {
            type: 'text',
            name: 'mutedForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#6b7280',
          },
          // accent
          {
            type: 'text',
            name: 'accent',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#e2e8f0',
          },
          // accentForeground
          {
            type: 'text',
            name: 'accentForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#1e293b',
          },
          // destructive
          {
            type: 'text',
            name: 'destructive',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#ef4444',
          },
          // destructiveForeground
          {
            type: 'text',
            name: 'destructiveForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#f1f5f9',
          },
          // border
          {
            type: 'text',
            name: 'border',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#d1d5db',
          },
          // input
          {
            type: 'text',
            name: 'input',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#d1d5db',
          },
          // ring
          {
            type: 'text',
            name: 'ring',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#9372f7',
          },
          // sidebar
          {
            type: 'text',
            name: 'sidebar',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#9372f7',
          },
          // sidebarForeground
          {
            type: 'text',
            name: 'sidebarForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#9372f7',
          },
          // sidebarPrimary
          {
            type: 'text',
            name: 'sidebarPrimary',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#9372f7',
          },
          // sidebarPrimaryForeground
          {
            type: 'text',
            name: 'sidebarPrimaryForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#9372f7',
          },
          // sidebarBorder
          {
            type: 'text',
            name: 'sidebarBorder',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#9372f7',
          },
          // sidebarRing
          {
            type: 'text',
            name: 'sidebarRing',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#9372f7',
          },
        ],
      },
      {
        type: 'group',
        name: 'darkMode',
        fields: [
          // background
          {
            type: 'text',
            name: 'background',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#ffffff',
          },
          // foreground
          {
            type: 'text',
            name: 'foreground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#0a0a0a',
          },
          // card
          {
            type: 'text',
            name: 'card',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#ffffff',
          },
          // cardForeground
          {
            type: 'text',
            name: 'cardForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#0a0a0a',
          },
          // popover
          {
            type: 'text',
            name: 'popover',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#ffffff',
          },
          // popoverForeground
          {
            type: 'text',
            name: 'popoverForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#0a0a0a',
          },
          // primary
          {
            type: 'text',
            name: 'primary',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#9372f7',
          },
          // primaryForeground
          {
            type: 'text',
            name: 'primaryForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#f1f5f9',
          },
          // secondary
          {
            type: 'text',
            name: 'secondary',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#e2e8f0',
          },
          // secondaryForeground
          {
            type: 'text',
            name: 'secondaryForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#1e293b',
          },
          // muted
          {
            type: 'text',
            name: 'muted',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#e2e8f0',
          },
          // mutedForeground
          {
            type: 'text',
            name: 'mutedForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#6b7280',
          },
          // accent
          {
            type: 'text',
            name: 'accent',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#e2e8f0',
          },
          // accentForeground
          {
            type: 'text',
            name: 'accentForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#1e293b',
          },
          // destructive
          {
            type: 'text',
            name: 'destructive',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#ef4444',
          },
          // destructiveForeground
          {
            type: 'text',
            name: 'destructiveForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#f1f5f9',
          },
          // border
          {
            type: 'text',
            name: 'border',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#d1d5db',
          },
          // input
          {
            type: 'text',
            name: 'input',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#d1d5db',
          },
          // ring
          {
            type: 'text',
            name: 'ring',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#9372f7',
          },
          // sidebar
          {
            type: 'text',
            name: 'sidebar',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#9372f7',
          },
          // sidebarForeground
          {
            type: 'text',
            name: 'sidebarForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#9372f7',
          },
          // sidebarPrimary
          {
            type: 'text',
            name: 'sidebarPrimary',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#9372f7',
          },
          // sidebarPrimaryForeground
          {
            type: 'text',
            name: 'sidebarPrimaryForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#9372f7',
          },
          // sidebarBorder
          {
            type: 'text',
            name: 'sidebarBorder',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#9372f7',
          },
          // sidebarRing
          {
            type: 'text',
            name: 'sidebarRing',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: '#9372f7',
          },
        ],
      },
    ],
  },
  // Fonts
  {
    type: 'group',
    name: 'fonts',
    fields: [
      {
        type: 'group',
        name: 'display',
        label: 'Display Font',
        fields: [
          {
            name: 'type',
            type: 'radio',
            required: true,
            options: [
              {
                label: 'Custom Font',
                value: 'customFont',
              },
              {
                label: 'Google Font',
                value: 'googleFont',
              },
            ],
            defaultValue: 'googleFont',
          },
          {
            type: 'row',
            fields: fontConfig({
              remoteFont:
                'https://fonts.googleapis.com/css2?family=Chewy&display=swap',
              fontName: 'Chewy',
            }),
          },
        ],
      },
      {
        type: 'group',
        name: 'body',
        label: 'Body Font',
        fields: [
          {
            name: 'type',
            type: 'radio',
            required: true,
            options: [
              {
                label: 'Custom Font',
                value: 'customFont',
              },
              {
                label: 'Google Font',
                value: 'googleFont',
              },
            ],
            defaultValue: 'googleFont',
          },
          {
            type: 'row',
            fields: fontConfig({
              remoteFont:
                'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap',
              fontName: 'Roboto',
            }),
          },
        ],
      },
    ],
  },
  // Radius
  {
    admin: {
      components: {
        Field: '@/payload/fields/theme/RadiusField',
      },
    },
    type: 'select',
    name: 'radius',
    options: [
      {
        label: 'None',
        value: 'none',
      },
      {
        label: 'Small',
        value: 'small',
      },
      {
        label: 'Medium',
        value: 'medium',
      },
      {
        label: 'Large',
        value: 'large',
      },
      {
        label: 'Full',
        value: 'full',
      },
    ],
    required: true,
    defaultValue: 'none',
  },
]
