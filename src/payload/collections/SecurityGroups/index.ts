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
      name: 'region',
      type: 'text',
      required: true,
      label: 'Region',
    },
    {
      name: 'cloudProviderAccount',
      type: 'relationship',
      relationTo: 'cloudProviderAccounts',
      label: 'Cloud Provider Account',
    },
    {
      name: 'groupId',
      type: 'text',
      required: true,
      label: 'Security Group ID',
      admin: {
        description:
          'The ID of the security group in the cloud provider (e.g., sg-12345 for AWS)',
      },
    },
    {
      name: 'vpcId',
      type: 'text',
      label: 'VPC ID',
      admin: {
        condition: data => ['aws', 'azure'].includes(data?.provider),
        description:
          'The ID of the VPC/Virtual Network this security group belongs to',
      },
    },
    {
      name: 'ruleType',
      type: 'select',
      required: true,
      options: [
        { label: 'Ingress (Inbound)', value: 'ingress' },
        { label: 'Egress (Outbound)', value: 'egress' },
      ],
      label: 'Rule Type',
      admin: {
        description: 'Specify whether this is an inbound or outbound rule',
      },
    },
    {
      name: 'rule',
      type: 'group',
      label: 'Security Rule',
      fields: [
        {
          name: 'protocol',
          type: 'select',
          required: true,
          options: [
            { label: 'TCP', value: 'tcp' },
            { label: 'UDP', value: 'udp' },
            { label: 'ICMP', value: 'icmp' },
            { label: 'All', value: '-1' },
          ],
        },
        {
          name: 'fromPort',
          type: 'number',
          required: true,
          min: 0,
          max: 65535,
          admin: {
            condition: (data, siblingData) =>
              siblingData.protocol !== 'icmp' && siblingData.protocol !== '-1',
          },
        },
        {
          name: 'toPort',
          type: 'number',
          required: true,
          min: 0,
          max: 65535,
          admin: {
            condition: (data, siblingData) =>
              siblingData.protocol !== 'icmp' && siblingData.protocol !== '-1',
          },
        },
        {
          name: 'targetType',
          type: 'select',
          required: true,
          options: [
            { label: 'CIDR Block', value: 'cidr' },
            { label: 'Security Group', value: 'sg' },
            { label: 'Prefix List', value: 'prefix' },
          ],
          defaultValue: 'cidr',
        },
        {
          name: 'cidrValue',
          type: 'text',
          admin: {
            condition: (data, siblingData) => siblingData.targetType === 'cidr',
            description: 'CIDR notation (e.g., 0.0.0.0/0 for anywhere)',
          },
        },
        {
          name: 'securityGroupId',
          type: 'text',
          admin: {
            condition: (data, siblingData) => siblingData.targetType === 'sg',
            description: 'ID of the security group',
          },
        },
        {
          name: 'prefixListId',
          type: 'text',
          admin: {
            condition: (data, siblingData) =>
              siblingData.targetType === 'prefix',
            description: 'ID of the prefix list',
          },
        },
        {
          name: 'description',
          type: 'text',
          label: 'Rule Description',
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
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}

export default SecurityGroups
