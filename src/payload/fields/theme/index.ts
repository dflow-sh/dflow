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
            defaultValue: 'hsl(240, 100.0000%, 98.0392%)',
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
            defaultValue: 'hsl(240, 27.5862%, 22.7451%)',
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
            defaultValue: 'hsl(0, 0%, 100%)',
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
            defaultValue: 'hsl(240, 27.5862%, 22.7451%)',
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
            defaultValue: 'hsl(0, 0%, 100%)',
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
            defaultValue: 'hsl(240, 27.5862%, 22.7451%)',
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
            defaultValue: 'hsl(251.9008, 55.7604%, 57.4510%)',
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
            defaultValue: 'hsl(0, 0%, 100%)',
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
            defaultValue: 'hsl(249.3750, 100%, 93.7255%)',
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
            defaultValue: 'hsl(249.3750, 33.3333%, 37.6471%)',
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
            defaultValue: 'hsl(240, 50.0000%, 96.0784%)',
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
            defaultValue: 'hsl(240, 12.1951%, 48.2353%)',
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
            defaultValue: 'hsl(218.4615, 100.0000%, 92.3529%)',
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
            defaultValue: 'hsl(240, 27.5862%, 22.7451%)',
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
            defaultValue: 'hsl(350.1754, 100%, 66.4706%)',
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
            defaultValue: 'hsl(0, 0%, 100%)',
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
            defaultValue: 'hsl(240, 34.7826%, 90.9804%)',
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
            defaultValue: 'hsl(240, 34.7826%, 90.9804%)',
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
            defaultValue: 'hsl(251.9008, 55.7604%, 57.4510%)',
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
            defaultValue: 'hsl(240, 50.0000%, 96.0784%)',
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
            defaultValue: 'hsl(251.9008, 55.7604%, 57.4510%)',
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
            defaultValue: 'hsl(0, 0%, 100%)',
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
            defaultValue: 'hsl(218.4615, 100.0000%, 92.3529%)',
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
            defaultValue: 'hsl(240, 27.5862%, 22.7451%)',
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
            defaultValue: 'hsl(240, 34.7826%, 90.9804%)',
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
            defaultValue: 'hsl(251.9008, 55.7604%, 57.4510%)',
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
            defaultValue: 'hsl(221, 50%, 11%)',
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
            defaultValue: 'hsl(240, 66.67%, 94.12%)',
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
            defaultValue: 'hsl(240, 27.59%, 22.75%)',
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
            defaultValue: 'hsl(240, 100%, 97.06%)',
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
            defaultValue: 'hsl(217, 33%, 17%)',
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
            defaultValue: 'hsl(240, 66.67%, 94.12%)',
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
            defaultValue: 'hsl(258, 71%, 61%)',
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
            defaultValue: 'hsl(0, 0%, 100%)',
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
            defaultValue: 'hsl(235, 31.49%, 35.49%)',
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
            defaultValue: 'hsl(240, 34.78%, 90.98%)',
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
            defaultValue: 'hsl(240, 27.59%, 22.75%)',
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
            defaultValue: 'hsl(215, 20%, 65%)',
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
            defaultValue: 'hsl(217, 19, 27)',
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
            defaultValue: 'hsl(240, 66.67%, 94.12%)',
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
            defaultValue: 'hsl(0, 73.46%, 41.37%)',
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
            defaultValue: 'hsl(0, 0%, 100%)',
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
            defaultValue: 'hsl(215, 25%, 27%)',
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
            defaultValue: 'hsl(215, 25%, 27%)',
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
            defaultValue: 'hsl(291, 63.72%, 42.16%)',
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
            defaultValue: 'hsl(30, 3.3333%, 11.7647%)',
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
            defaultValue: 'hsl(240, 100%, 90.78%)',
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
            defaultValue: 'hsl(262, 51.87%, 47.25%)',
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
            defaultValue: 'hsl(0, 0%, 100%)',
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
            defaultValue: 'hsl(240, 24.49%, 38.43%)',
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
            defaultValue: 'hsl(0, 0%, 87.84%)',
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
            defaultValue: 'hsl(240, 24.49%, 38.43%)',
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
            defaultValue: 'hsl(291, 63.72%, 42.16%)',
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
