import { CollectionConfig } from 'payload'

import { isAdmin } from '../../access/isAdmin'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  trash: true,
  admin: {
    useAsTitle: 'name',
    group: 'Users & Tenants',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'subdomain',
      label: 'Subdomain',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
  ],
}
// Default export for Tenants
import Tenants from './Tenants'
export default Tenants
