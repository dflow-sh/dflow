import { CollectionConfig } from 'payload'

import { isAdmin } from '@/payload/access/isAdmin'

// {
//     "http": {
//       "routers": {
//         "{serviceName}-{serverName}-router": {
//           "rule": "Host(`{serviceName}.{serverName}.up.dflow.sh`)",
//           "entryPoints": [
//             "websecure"
//           ],
//           "tls": {
//             "certResolver": "letsencrypt"
//           },
//           "service": "{serviceName}-{serverName}-service"
//         }
//       },
//       "services": {
//         "{serviceName}-{serverName}-service": {
//           "loadBalancer": {
//             "servers": [
//               {
//                 "url": "http://100.122.90.48:80"
//               }
//             ]
//           }
//         }
//       }
//     }
//   }

export const Traefik: CollectionConfig = {
  slug: 'traefik',
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'service',
      relationTo: 'services',
      type: 'relationship',
      required: true,
      hasMany: false,
      admin: {
        description:
          'Add the service for which traefik-configuration relates to',
      },
    },
    {
      name: 'configuration',
      type: 'json',
      required: true,
    },
  ],
}
