import { CollectionConfig } from 'payload'

import { isAdmin } from '@/payload/access/isAdmin'

import { securityGroupBeforeChangeHook } from './hooks/securityGroupBeforeChangeHook'
import { securityGroupBeforeDeleteHook } from './hooks/securityGroupBeforeDeleteHook'

const SecurityGroups: CollectionConfig = {
  slug: 'securityGroups',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    readVersions: isAdmin,
  },
  hooks: {
    beforeChange: [securityGroupBeforeChangeHook],
    beforeDelete: [securityGroupBeforeDeleteHook],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Security Group Name',
      access: {
        create: () => true,
        update: () => false,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      required: true,
      access: {
        create: () => true,
        update: () => false,
      },
    },
    {
      name: 'cloudProvider',
      type: 'select',
      required: false,
      options: [
        { label: 'AWS', value: 'aws' },
        { label: 'Azure', value: 'azure' },
        { label: 'Google Cloud Platform', value: 'gcp' },
        { label: 'Digital Ocean', value: 'digitalocean' },
      ],
      label: 'Cloud Provider',
      access: {
        create: () => true,
        update: () => false,
      },
    },
    {
      name: 'cloudProviderAccount',
      type: 'relationship',
      relationTo: 'cloudProviderAccounts',
      label: 'Cloud Provider Account',
      required: false,
      filterOptions: ({ relationTo, siblingData }) => {
        if (relationTo === 'cloudProviderAccounts') {
          return {
            type: {
              equals: (siblingData as any)?.cloudProvider,
            },
          }
        }

        return false
      },
      access: {
        create: () => true,
        update: () => false,
      },
    },
    {
      name: 'inboundRules',
      type: 'array',
      label: 'Inbound Rules',
      minRows: 1,
      fields: [
        {
          name: 'description',
          type: 'text',
          label: 'Description',
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          label: 'Type',
          options: [
            { label: 'All Traffic', value: 'all-traffic' },
            { label: 'All TCP', value: 'all-tcp' },
            { label: 'All UDP', value: 'all-udp' },
            { label: 'SSH', value: 'ssh' },
            { label: 'HTTP', value: 'http' },
            { label: 'HTTPS', value: 'https' },
            { label: 'Custom TCP', value: 'custom-tcp' },
            { label: 'Custom UDP', value: 'custom-udp' },
            { label: 'ICMP', value: 'icmp' },
            { label: 'ICMPv6', value: 'icmpv6' },
            { label: 'SMTP', value: 'smtp' },
            { label: 'POP3', value: 'pop3' },
            { label: 'IMAP', value: 'imap' },
            { label: 'MS SQL', value: 'ms-sql' },
            { label: 'MySQL/Aurora', value: 'mysql-aurora' },
            { label: 'PostgreSQL', value: 'postgresql' },
            { label: 'DNS (UDP)', value: 'dns-udp' },
            { label: 'RDP', value: 'rdp' },
            { label: 'NFS', value: 'nfs' },
            { label: 'Custom Protocol', value: 'custom-protocol' },
          ],
          defaultValue: 'custom-tcp',
        },
        {
          name: 'protocol',
          type: 'text',
          label: 'Protocol',
          admin: {
            condition: (data, siblingData) =>
              siblingData?.type === 'custom-protocol',
          },
        },
        {
          name: 'fromPort',
          type: 'number',
          label: 'From Port',
          min: -1,
          max: 65535,
          admin: {
            condition: (data, siblingData) => {
              return !['all-traffic', 'icmp', 'icmpv6'].includes(
                siblingData?.type,
              )
            },
          },
        },
        {
          name: 'toPort',
          type: 'number',
          label: 'To Port',
          min: -1,
          max: 65535,
          admin: {
            condition: (data, siblingData) => {
              return !['all-traffic', 'icmp', 'icmpv6'].includes(
                siblingData?.type,
              )
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
          defaultValue: 'anywhere-ipv4',
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
            description: 'Auto-generated after creation',
          },
        },
      ],
    },
    {
      name: 'outboundRules',
      type: 'array',
      label: 'Outbound Rules',
      minRows: 1,
      fields: [
        {
          name: 'description',
          type: 'text',
          label: 'Description',
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          label: 'Type',
          options: [
            { label: 'All Traffic', value: 'all-traffic' },
            { label: 'All TCP', value: 'all-tcp' },
            { label: 'All UDP', value: 'all-udp' },
            { label: 'SSH', value: 'ssh' },
            { label: 'HTTP', value: 'http' },
            { label: 'HTTPS', value: 'https' },
            { label: 'Custom TCP', value: 'custom-tcp' },
            { label: 'Custom UDP', value: 'custom-udp' },
            { label: 'ICMP', value: 'icmp' },
            { label: 'ICMPv6', value: 'icmpv6' },
            { label: 'SMTP', value: 'smtp' },
            { label: 'POP3', value: 'pop3' },
            { label: 'IMAP', value: 'imap' },
            { label: 'MS SQL', value: 'ms-sql' },
            { label: 'MySQL/Aurora', value: 'mysql-aurora' },
            { label: 'PostgreSQL', value: 'postgresql' },
            { label: 'DNS (UDP)', value: 'dns-udp' },
            { label: 'RDP', value: 'rdp' },
            { label: 'NFS', value: 'nfs' },
            { label: 'Custom Protocol', value: 'custom-protocol' },
          ],
          defaultValue: 'all-traffic',
        },
        {
          name: 'protocol',
          type: 'text',
          label: 'Protocol',
          admin: {
            condition: (data, siblingData) =>
              siblingData?.type === 'custom-protocol',
          },
        },
        {
          name: 'fromPort',
          type: 'number',
          label: 'From Port',
          min: -1,
          max: 65535,
          admin: {
            condition: (data, siblingData) => {
              return !['all-traffic', 'icmp', 'icmpv6'].includes(
                siblingData?.type,
              )
            },
          },
        },
        {
          name: 'toPort',
          type: 'number',
          label: 'To Port',
          min: -1,
          max: 65535,
          admin: {
            condition: (data, siblingData) => {
              return !['all-traffic', 'icmp', 'icmpv6'].includes(
                siblingData?.type,
              )
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
          defaultValue: 'anywhere-ipv4',
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
            description: 'Auto-generated after creation',
          },
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
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
        // readOnly: true,
        position: 'sidebar',
        description: 'Auto-generated by cloud provider',
      },
    },
    {
      name: 'syncStatus',
      type: 'select',
      options: [
        { label: 'In Sync', value: 'in-sync' },
        { label: 'Pending Sync', value: 'pending' },
        { label: 'Sync Failed', value: 'failed' },
        { label: 'Sync Started', value: 'start-sync' },
      ],
      defaultValue: 'pending',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'lastSyncedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}

export default SecurityGroups
