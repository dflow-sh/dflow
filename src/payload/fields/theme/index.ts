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
            defaultValue: 'oklch(0.973 0.0133 286.1503)',
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
            defaultValue: 'oklch(0.3015 0.0572 282.4176)',
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
            defaultValue: 'oklch(1 0 0)',
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
            defaultValue: 'oklch(0.2686 0 0)',
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
            defaultValue: 'oklch(1 0 0)',
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
            defaultValue: 'oklch(0.2686 0 0)',
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
            defaultValue: 'oklch(0.5417 0.179 288.0332)',
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
            defaultValue: 'oklch(0 0 0)',
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
            defaultValue: 'oklch(0.9174 0.0435 292.6901)',
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
            defaultValue: 'oklch(0.4461 0.0263 256.8018)',
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
            defaultValue: 'oklch(0.958 0.0133 286.1454)',
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
            defaultValue: 'oklch(0.551 0.0234 264.3637)',
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
            defaultValue: 'oklch(0.9221 0.0373 262.141)',
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
            defaultValue: 'oklch(0.4732 0.1247 46.2007)',
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
            defaultValue: 'oklch(0.6861 0.2061 14.9941)',
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
            defaultValue: 'oklch(1 0 0)',
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
            defaultValue: 'oklch(0.9115 0.0216 285.9625)',
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
            defaultValue: 'oklch(0.9115 0.0216 285.9625)',
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
            defaultValue: 'oklch(0.5417 0.179 288.0332)',
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
            defaultValue: 'oklch(95.802% 0.01344 286.031)',
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
            defaultValue: 'hsl(240, 27.5862%, 22.7451%)',
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
            defaultValue: 'oklch(54.168% 0.17912 288.036)',
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
            defaultValue: 'oklch(100% 0.00011 271.152)',
          },
          // sidebarAccent
          {
            type: 'text',
            name: 'sidebarAccent',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: 'oklch(92.214% 0.0374 262.174)',
          },
          // sidebarAccentForeground
          {
            type: 'text',
            name: 'sidebarAccentForeground',
            admin: {
              components: {
                Field: '@/payload/fields/theme/ColorField',
              },
            },
            required: true,
            defaultValue: 'oklch(30.147% 0.05728 282.419)',
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
            defaultValue: 'oklch(91.145% 0.02175 285.899)',
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
            defaultValue: 'oklch(54.168% 0.17912 288.036)',
          },
        ],
      },
      {
        type: 'group',
        name: 'darkMode',
        fields: [
          {
            type: 'text',
            name: 'background',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(0.2069 0.0403 263.9914)',
          },
          // foreground
          {
            type: 'text',
            name: 'foreground',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(0.9309 0.0269 285.8648)',
          },
          // card
          {
            type: 'text',
            name: 'card',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(0.3015 0.0572 282.4176)',
          },
          // cardForeground
          {
            type: 'text',
            name: 'cardForeground',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(0.9219 0 0)',
          },
          // popover
          {
            type: 'text',
            name: 'popover',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(0.2755 0.037 260.0225)',
          },
          // popoverForeground
          {
            type: 'text',
            name: 'popoverForeground',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(0.9219 0 0)',
          },
          // primary
          {
            type: 'text',
            name: 'primary',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(0.5695 0.2038 292.4287)',
          },
          // primaryForeground
          {
            type: 'text',
            name: 'primaryForeground',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(100% 0.00011 271.152)',
          },
          // secondary
          {
            type: 'text',
            name: 'secondary',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(0.4043 0.087 277.6045)',
          },
          // secondaryForeground
          {
            type: 'text',
            name: 'secondaryForeground',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(0.9219 0 0)',
          },
          // muted
          {
            type: 'text',
            name: 'muted',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(0.3015 0.0572 282.4176)',
          },
          // mutedForeground
          {
            type: 'text',
            name: 'mutedForeground',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(0.7155 0 0)',
          },
          // accent
          {
            type: 'text',
            name: 'accent',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(0.3767 0.0305 259.7354)',
          },
          // accentForeground
          {
            type: 'text',
            name: 'accentForeground',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(93.09% 0.02705 285.814)',
          },
          // destructive
          {
            type: 'text',
            name: 'destructive',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(0.5016 0.1887 27.4816)',
          },
          // destructiveForeground
          {
            type: 'text',
            name: 'destructiveForeground',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(1 0 0)',
          },
          // border
          {
            type: 'text',
            name: 'border',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(0.3755 0.0391 257.2866)',
          },
          // input
          {
            type: 'text',
            name: 'input',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(0.3755 0.0391 257.2866)',
          },
          // ring
          {
            type: 'text',
            name: 'ring',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(0.5154 0.2147 320.8737)',
          },
          // sidebar
          {
            type: 'text',
            name: 'sidebar',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(23.574% 0.00241 67.461)',
          },
          // sidebarForeground
          {
            type: 'text',
            name: 'sidebarForeground',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(87.299% 0.06481 284.967)',
          },
          // sidebarPrimary
          {
            type: 'text',
            name: 'sidebarPrimary',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(47.531% 0.18633 295.254)',
          },
          // sidebarPrimaryForeground
          {
            type: 'text',
            name: 'sidebarPrimaryForeground',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(100% 0.00011 271.152)',
          },
          // sidebarAccent
          {
            type: 'text',
            name: 'sidebarAccent',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(43.141% 0.07862 282.604)',
          },
          // sidebarAccentForeground
          {
            type: 'text',
            name: 'sidebarAccentForeground',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(90.67% 0.0001 271.152)',
          },
          // sidebarBorder
          {
            type: 'text',
            name: 'sidebarBorder',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(43.141% 0.07862 282.604)',
          },
          // sidebarRing
          {
            type: 'text',
            name: 'sidebarRing',
            admin: {
              components: { Field: '@/payload/fields/theme/ColorField' },
            },
            required: true,
            defaultValue: 'oklch(51.537% 0.2148 320.863)',
          },
        ],
      },
    ],
  },
  // Fonts
  {
    type: 'group',
    name: 'fonts',
    admin: {
      components: {
        beforeInput: ['@/payload/fields/theme/FontFieldDescription'],
      },
    },
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
                'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap',
              fontName: 'Geist',
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
    defaultValue: 'medium',
  },
]
