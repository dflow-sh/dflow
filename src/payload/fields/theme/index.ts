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
          description: 'Check to apply custom theme colors',
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
            defaultValue: 'hsl(48, 33.3333%, 97.0588%)',
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
            defaultValue: 'hsl(48, 19.6078%, 20%)',
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
            defaultValue: 'hsl(48, 33.3333%, 97.0588%)',
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
            defaultValue: 'hsl(60, 2.5641%, 7.6471%)',
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
            defaultValue: 'hsl(50.7692, 19.4030%, 13.1373%)',
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
            defaultValue: 'hsl(15.1111, 55.5556%, 52.3529%)',
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
            defaultValue: 'hsl(46.1538, 22.8070%, 88.8235%)',
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
            defaultValue: 'hsl(50.7692, 8.4967%, 30.0000%)',
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
            defaultValue: 'hsl(44.0000, 29.4118%, 90%)',
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
            defaultValue: 'hsl(50.0000, 2.3622%, 50.1961%)',
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
            defaultValue: 'hsl(46.1538, 22.8070%, 88.8235%)',
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
            defaultValue: 'hsl(50.7692, 19.4030%, 13.1373%)',
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
            defaultValue: 'hsl(60, 2.5641%, 7.6471%)',
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
            defaultValue: 'hsl(50, 7.5000%, 84.3137%)',
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
            defaultValue: 'hsl(50.7692, 7.9755%, 68.0392%)',
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
            defaultValue: 'hsl(15.1111, 55.5556%, 52.3529%)',
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
            defaultValue: 'hsl(51.4286, 25.9259%, 94.7059%)',
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
            defaultValue: 'hsl(60, 2.5210%, 23.3333%)',
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
            defaultValue: 'hsl(15.1111, 55.5556%, 52.3529%)',
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
            defaultValue: 'hsl(0, 0%, 98.4314%)',
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
            defaultValue: 'hsl(0, 0%, 92.1569%)',
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
            defaultValue: 'hsl(0, 0%, 70.9804%)',
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
            defaultValue: 'hsl(60, 2.7027%, 14.5098%)',
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
            defaultValue: 'hsl(46.1538, 9.7744%, 73.9216%)',
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
            defaultValue: 'hsl(60, 2.7027%, 14.5098%)',
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
            defaultValue: 'hsl(48, 33.3333%, 97.0588%)',
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
            defaultValue: 'hsl(60, 2.1277%, 18.4314%)',
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
            defaultValue: 'hsl(60, 5.4545%, 89.2157%)',
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
            defaultValue: 'hsl(14.7692, 63.1068%, 59.6078%)',
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
            defaultValue: 'hsl(48, 33.3333%, 97.0588%)',
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
            defaultValue: 'hsl(60, 2.1277%, 18.4314%)',
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
            defaultValue: 'hsl(60, 3.8462%, 10.1961%)',
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
            defaultValue: 'hsl(51.4286, 8.8608%, 69.0196%)',
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
            defaultValue: 'hsl(48, 10.6383%, 9.2157%)',
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
            defaultValue: 'hsl(51.4286, 25.9259%, 94.7059%)',
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
            defaultValue: 'hsl(0, 84.2365%, 60.1961%)',
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
            defaultValue: 'hsl(60, 5.0847%, 23.1373%)',
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
            defaultValue: 'hsl(52.5000, 5.1282%, 30.5882%)',
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
            defaultValue: 'hsl(14.7692, 63.1068%, 59.6078%)',
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
            defaultValue: 'hsl(46.1538, 9.7744%, 73.9216%)',
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
            defaultValue: 'hsl(0, 0%, 20.3922%)',
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
            defaultValue: 'hsl(0, 0%, 98.4314%)',
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
            defaultValue: 'hsl(0, 0%, 92.1569%)',
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
            defaultValue: 'hsl(0, 0%, 70.9804%)',
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
