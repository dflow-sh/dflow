import { CollectionConfig } from 'payload'

const SecurityGroups: CollectionConfig = {
  slug: 'securityGroups',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Security Group Name',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'cloudProvider',
      type: 'select',
      required: true,
      options: [
        { label: 'AWS', value: 'aws' },
        { label: 'Azure', value: 'azure' },
        { label: 'Google Cloud Platform', value: 'gcp' },
        { label: 'Digital Ocean', value: 'digitalocean' },
      ],
      label: 'Cloud Provider',
    },
    {
      name: 'cloudProviderAccount',
      type: 'relationship',
      relationTo: 'cloudProviderAccounts',
      label: 'Cloud Provider Account',
      filterOptions: ({ relationTo, siblingData }) => {
        if (relationTo === 'cloudProviderAccounts') {
          return {
            type: {
              equals: siblingData?.cloudProvider,
            },
          }
        }

        return false
      },
    },
    {
      name: 'inboundRules',
      type: 'array',
      label: 'Inbound Rules',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Security Group Name',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          label: 'Type',
          options: [
            { label: 'All Traffic', value: 'all-traffic' },
            { label: 'Custom TCP', value: 'custom-tcp' },
            { label: 'Custom UDP', value: 'custom-udp' },
            { label: 'Custom ICMP', value: 'custom-icmp' },
            { label: 'SSH', value: 'ssh' },
            { label: 'HTTPS', value: 'https' },
            { label: 'HTTP', value: 'http' },
            { label: 'RDP', value: 'rdp' },
            { label: 'Custom', value: 'custom' },
          ],
          defaultValue: 'custom-tcp',
        },
        {
          name: 'protocol',
          type: 'select',
          required: true,
          label: 'Protocol',
          options: [
            { label: 'TCP', value: 'tcp' },
            { label: 'UDP', value: 'udp' },
            { label: 'ICMP', value: 'icmp' },
            { label: 'All', value: 'all' },
          ],
          defaultValue: 'tcp',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'custom',
          },
        },
        {
          name: 'fromPort',
          type: 'number',
          required: true,
          min: 0,
          max: 65535,
          label: 'Port Range (From)',
          admin: {
            condition: (data, siblingData) => {
              if (siblingData?.type === 'custom') {
                return (
                  siblingData?.protocol !== 'icmp' &&
                  siblingData?.protocol !== 'all'
                )
              }
              return !['all-traffic', 'custom-icmp'].includes(siblingData?.type)
            },
          },
        },
        {
          name: 'toPort',
          type: 'number',
          required: true,
          min: 0,
          max: 65535,
          label: 'Port Range (To)',
          admin: {
            condition: (data, siblingData) => {
              if (siblingData?.type === 'custom') {
                return (
                  siblingData?.protocol !== 'icmp' &&
                  siblingData?.protocol !== 'all'
                )
              }
              return !['all-traffic', 'custom-icmp'].includes(siblingData?.type)
            },
          },
        },
        {
          name: 'sourceType',
          type: 'select',
          required: true,
          label: 'Source Type',
          options: [
            { label: 'My IP', value: 'my-ip' },
            { label: 'Anywhere-IPv4', value: 'anywhere-ipv4' },
            { label: 'Anywhere-IPv6', value: 'anywhere-ipv6' },
            { label: 'Custom', value: 'custom' },
          ],
          defaultValue: 'cidr',
        },
        {
          name: 'source',
          type: 'text',
          label: 'Source',
          required: true,
          admin: {
            description: 'CIDR notation (e.g., 0.0.0.0/0 for anywhere)',
          },
        },
        {
          name: 'securityGroupRuleId',
          type: 'text',
          label: 'Security Group Rule ID',
          admin: {
            readOnly: true,
            description:
              'Auto-generate after creation. The ID of the security group rule.',
          },
        },
      ],
    },
    {
      name: 'outboundRules',
      type: 'array',
      label: 'Outbound Rules',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Security Group Name',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          label: 'Type',
          options: [
            { label: 'All Traffic', value: 'all-traffic' },
            { label: 'Custom TCP', value: 'custom-tcp' },
            { label: 'Custom UDP', value: 'custom-udp' },
            { label: 'Custom ICMP', value: 'custom-icmp' },
            { label: 'SSH', value: 'ssh' },
            { label: 'HTTPS', value: 'https' },
            { label: 'HTTP', value: 'http' },
            { label: 'RDP', value: 'rdp' },
            { label: 'Custom', value: 'custom' },
          ],
          defaultValue: 'custom-tcp',
        },
        {
          name: 'protocol',
          type: 'select',
          required: true,
          label: 'Protocol',
          options: [
            { label: 'TCP', value: 'tcp' },
            { label: 'UDP', value: 'udp' },
            { label: 'ICMP', value: 'icmp' },
            { label: 'All', value: 'all' },
          ],
          defaultValue: 'tcp',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'custom',
          },
        },
        {
          name: 'fromPort',
          type: 'number',
          required: true,
          min: 0,
          max: 65535,
          label: 'Port Range (From)',
          admin: {
            condition: (data, siblingData) => {
              if (siblingData?.type === 'custom') {
                return (
                  siblingData?.protocol !== 'icmp' &&
                  siblingData?.protocol !== 'all'
                )
              }
              return !['all-traffic', 'custom-icmp'].includes(siblingData?.type)
            },
          },
        },
        {
          name: 'toPort',
          type: 'number',
          required: true,
          min: 0,
          max: 65535,
          label: 'Port Range (To)',
          admin: {
            condition: (data, siblingData) => {
              if (siblingData?.type === 'custom') {
                return (
                  siblingData?.protocol !== 'icmp' &&
                  siblingData?.protocol !== 'all'
                )
              }
              return !['all-traffic', 'custom-icmp'].includes(siblingData?.type)
            },
          },
        },
        {
          name: 'destinationType',
          type: 'select',
          required: true,
          label: 'Destination Type',
          options: [
            { label: 'My IP', value: 'my-ip' },
            { label: 'Anywhere-IPv4', value: 'anywhere-ipv4' },
            { label: 'Anywhere-IPv6', value: 'anywhere-ipv6' },
            { label: 'Custom', value: 'custom' },
          ],
          defaultValue: 'cidr',
        },
        {
          name: 'destination',
          type: 'text',
          label: 'Destination',
          required: true,
          admin: {
            description: 'CIDR notation (e.g., 0.0.0.0/0 for anywhere)',
          },
        },
        {
          name: 'securityGroupRuleId',
          type: 'text',
          label: 'Security Group Rule ID',
          admin: {
            readOnly: true,
            description:
              'Auto-generate after creation. The ID of the security group rule.',
          },
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      admin: {
        description:
          'Key-value pairs used to organize and categorize resources',
      },
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
          label: 'Key',
        },
        {
          name: 'value',
          type: 'text',
          label: 'Value',
        },
      ],
    },
    {
      name: 'securityGroupId',
      type: 'text',
      label: 'Security Group ID',
      admin: {
        readOnly: true,
        description:
          'Auto-generate after creation. The ID of the security group in the cloud provider (e.g., sg-12345 for AWS)',
      },
    },
  ],
}

export default SecurityGroups
