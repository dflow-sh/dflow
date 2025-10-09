import { Media } from '@/payload-types'

export interface Config {
  auth: {
    users: UserAuthOperations
  }
  blocks: {}
  collections: {
    users: User
    templates: Template
    vpsPlans: VpsPlan
    vpsOrders: VpsOrder
    cards: Card
  }
  collectionsJoins: {}
  collectionsSelect: {}
  db: {
    defaultIDType: string
  }
  globals: {
    github: Github
  }
  globalsSelect: {}
  locale: null
}

export interface UserAuthOperations {
  forgotPassword: {
    email: string
    password: string
  }
  login: {
    email: string
    password: string
  }
  registerFirstUser: {
    email: string
    password: string
  }
  unlock: {
    email: string
    password: string
  }
}

export interface Template {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
  services?:
    | {
        name: string
        description?: string | null
        type: 'app' | 'database' | 'docker'
        providerType?:
          | ('github' | 'gitlab' | 'bitbucket' | 'azureDevOps' | 'gitea')
          | null
        githubSettings?: {
          repository: string
          owner: string
          branch: string
          buildPath: string
          port?: number | null
        }
        azureSettings?: {
          repository: string
          branch: string
          owner: string
          buildPath: string
          port?: number | null
        }
        giteaSettings?: {
          repository: string
          branch: string
          owner: string
          buildPath: string
          port?: number | null
        }
        gitlabSettings?: {
          repository: string
          branch: string
          owner: string
          buildPath: string
          port?: number | null
        }
        bitbucketSettings?: {
          repository: string
          owner: string
          branch: string
          buildPath: string
          port?: number | null
        }
        databaseDetails?: {
          type?:
            | (
                | 'postgres'
                | 'mongo'
                | 'mysql'
                | 'mariadb'
                | 'redis'
                | 'clickhouse'
              )
            | null
          exposedPorts?: string[] | null
        }
        dockerDetails?: {
          /**
           * Enter the docker-registry URL: ghrc://contentql/pin-bolt:latest
           */
          url?: string | null
          ports?:
            | {
                hostPort: number
                containerPort: number
                scheme: 'http' | 'https'
                id?: string | null
              }[]
            | null
        }
        builder?:
          | (
              | 'buildPacks'
              | 'railpack'
              | 'nixpacks'
              | 'dockerfile'
              | 'herokuBuildPacks'
              | 'static'
            )
          | null
        volumes?:
          | {
              hostPath: string
              containerPath: string
              id?: string | null
            }[]
          | null
        variables?:
          | {
              key: string
              value?: string | null
              id?: string | null
            }[]
          | null
        id?: string | null
      }[]
    | null
  /**
   * Automatically user will be selected.
   */
  user?: string | null
  /**
   * Type of the template
   */
  type?: ('community' | 'official') | null
  updatedAt: string
  createdAt: string
}

export interface Github {
  id: string
  githubStars?: number | null
  issues?:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  releases?:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  updatedAt?: string | null
  createdAt?: string | null
}

export interface VpsPlan {
  id: string
  /**
   * The name of the VPS plan (e.g., Cloud VPS 4C)
   */
  name: string
  slug?: string | null
  slugLock?: boolean | null
  /**
   * The name of the hosting platform (e.g., Contabo, HostUp)
   */
  platform: 'contabo' | 'hostup'
  cpu: {
    /**
     * Select the type of CPU allocated to this plan
     */
    type: 'virtual' | 'dedicated'
    /**
     * Specify the number of CPU cores available in this plan
     */
    cores: number
  }
  ram: {
    /**
     * Specify the amount of RAM available in this plan
     */
    size: number
    /**
     * Select the unit of RAM (KB, MB, GB, TB, PB)
     */
    unit: 'KB' | 'MB' | 'GB' | 'TB' | 'PB'
  }
  storageOptions?:
    | {
        /**
         * Select the type of storage (NVMe or SSD)
         */
        type: 'NVMe' | 'SSD'
        /**
         * Select the storage size
         */
        size: number
        /**
         * Select the unit of size (KB, MB, GB, TB, PB)
         */
        unit: 'KB' | 'MB' | 'GB' | 'TB' | 'PB'
        price: {
          /**
           * Select whether this region has an additional cost
           */
          type: 'free' | 'paid'
          /**
           * Specify the additional price if this region is paid
           */
          amount?: number | null
        }
        /**
         * Unique identifier for the addon in Contabo
         */
        addonId?: string | null
        /**
         * Unique identifier for the selected product
         */
        productId: string
        /**
         * Unique priceId for the selected product
         */
        stripePriceId: string
        id?: string | null
      }[]
    | null
  /**
   * Define the number of snapshots included in this plan
   */
  snapshots: number
  bandwidth: {
    /**
     * Total outbound traffic allowance
     */
    traffic: number
    /**
     * Select the unit for outbound traffic (KB, MB, GB, TB, PB)
     */
    trafficUnit: 'KB' | 'MB' | 'GB' | 'TB' | 'PB'
    /**
     * Check if incoming traffic is unlimited
     */
    incomingUnlimited?: boolean | null
  }
  pricing?:
    | {
        /**
         * Enter the subscription term length (1 to 12 months)
         */
        period: number
        /**
         * Specify the monthly price for this term
         */
        price: number
        /**
         * Specify the monthly offer price for this term
         */
        offerPrice?: number | null
        /**
         * Unique priceId for the selected product
         */
        stripePriceId: string
        id?: string | null
      }[]
    | null
  regionOptions?:
    | {
        /**
         * Available regions for this VPS
         */
        region: string
        /**
         * Enter the region code (e.g., EU, US-central, SIN, etc.)
         */
        regionCode: string
        /**
         * Latency in milliseconds (ms)
         */
        latency?: number | null
        /**
         * Quality of latency for this region
         */
        latencyQuality: 'good' | 'best'
        price: {
          /**
           * Select whether this region has an additional cost
           */
          type: 'free' | 'paid'
          /**
           * Specify the additional price if this region is paid
           */
          amount?: number | null
        }
        /**
         * Unique priceId for the selected product
         */
        stripePriceId: string
        id?: string | null
      }[]
    | null
  images?:
    | {
        /**
         * Select the category: OS, Apps, Panels, or Blockchain
         */
        category: 'os' | 'apps' | 'panels' | 'blockchain'
        /**
         * Enter the name of the OS or application
         */
        name: string
        /**
         * Enter a user-friendly label for the image name
         */
        label: string
        versions?:
          | {
              /**
               * Unique identifier for the selected image version
               */
              imageId: string
              /**
               * Specify the version of the OS or application
               */
              version: string
              /**
               * Enter a user-friendly label for the version
               */
              label: string
              price: {
                /**
                 * Specify if the version is included or paid
                 */
                type: 'included' | 'paid'
                /**
                 * Specify the additional cost if paid
                 */
                amount?: number | null
              }
              /**
               * Unique priceId for the selected product
               */
              stripePriceId: string
              id?: string | null
            }[]
          | null
        licenses?:
          | {
              /**
               * Enter a user-friendly label for the license
               */
              label: string
              /**
               * Specify the code of the license (e.g., cPanel, Plesk, etc.)
               */
              licenseCode: string
              price: {
                /**
                 * Specify if the version is included or paid
                 */
                type: 'included' | 'paid'
                /**
                 * Specify the additional cost if paid
                 */
                amount?: number | null
              }
              /**
               * Unique priceId for the selected product
               */
              stripePriceId: string
              id?: string | null
            }[]
          | null
        id?: string | null
      }[]
    | null
  loginDetails: {
    /**
     * Default username for the VPS
     */
    username: string
    /**
     * Specify password requirements or policy for the VPS
     */
    password?: string | null
    /**
     * Enable this option if the user wants to provide SSH keys
     */
    useSSHKeys?: boolean | null
  }
  backupOptions?:
    | {
        /**
         * Select the backup type
         */
        type: 'auto' | 'none'
        /**
         * Enter a user-friendly label for the backup type
         */
        label: string
        /**
         * Explain the purpose and benefits of the backup type
         */
        description?: string | null
        /**
         * Select how backups are performed
         */
        mode: 'automated' | 'manual'
        /**
         * Choose how often backups occur
         */
        frequency: 'daily' | 'on_demand'
        /**
         * Select the recovery method
         */
        recovery: 'one_click' | 'manual'
        /**
         * Number of retained backups
         */
        retention?: number | null
        price: {
          /**
           * Specify if backup is included or an extra cost
           */
          type: 'included' | 'paid'
          /**
           * Additional cost per month if paid
           */
          amount?: number | null
        }
        /**
         * Unique identifier for the addon in Contabo
         */
        addonId?: string | null
        /**
         * Unique priceId for the selected product
         */
        stripePriceId: string
        id?: string | null
      }[]
    | null
  networking?: {
    privateNetworking?:
      | {
          /**
           * Enter the name of the private network
           */
          name: string
          /**
           * Enter a user-friendly label for the private network
           */
          label: string
          price: {
            /**
             * Specify if the private network is included or paid
             */
            type: 'free' | 'paid'
            /**
             * Specify the additional cost per month if paid
             */
            amount?: number | null
          }
          /**
           * Unique identifier for the addon in Contabo
           */
          addonId?: string | null
          id?: string | null
        }[]
      | null
    bandwidth?:
      | {
          /**
           * Specify the total traffic allowance
           */
          traffic: string
          /**
           * Select the unit for outbound traffic (KB, MB, GB, TB, PB)
           */
          trafficUnit: 'KB' | 'MB' | 'GB' | 'TB' | 'PB'
          /**
           * Specify whether incoming traffic is unlimited
           */
          incomingUnlimited: boolean
          /**
           * Specify network connection speed
           */
          connectionSpeed: string
          price: {
            /**
             * Specify if the bandwidth is included or paid
             */
            type: 'free' | 'paid'
            /**
             * Specify the additional cost per month if paid
             */
            amount?: number | null
          }
          /**
           * Unique identifier for the addon in Contabo
           */
          addonId?: string | null
          id?: string | null
        }[]
      | null
    ipv4?:
      | {
          /**
           * Enter the name of the IPv4 allocation
           */
          name: string
          /**
           * Enter a user-friendly label for the IPv4 allocation
           */
          label: string
          price: {
            /**
             * Specify if the IPv4 address is included or paid
             */
            type: 'free' | 'paid'
            /**
             * Specify the additional cost per month if paid
             */
            amount?: number | null
          }
          /**
           * Unique identifier for the addon in Contabo
           */
          addonId?: string | null
          id?: string | null
        }[]
      | null
  }
  addOns?: {
    objectStorage?:
      | {
          /**
           * Enter the name of the object storage option
           */
          name: string
          /**
           * Specify the storage size
           */
          size: number
          /**
           * Select the unit of storage
           */
          unit: 'GB' | 'TB'
          /**
           * Specify the storage location
           */
          location: string
          price: {
            /**
             * Specify if the storage is included or paid
             */
            type: 'free' | 'paid'
            /**
             * Specify the cost if paid
             */
            amount?: number | null
          }
          /**
           * Unique identifier for the addon in Contabo
           */
          addonId?: string | null
          id?: string | null
        }[]
      | null
    serverManagement?:
      | {
          /**
           * Enter the type of server management
           */
          name: string
          price: {
            /**
             * Specify if the management option is free or paid
             */
            type: 'free' | 'paid'
            /**
             * Specify the additional cost if paid
             */
            amount?: number | null
          }
          /**
           * Unique identifier for the addon in Contabo
           */
          addonId?: string | null
          id?: string | null
        }[]
      | null
    monitoring?:
      | {
          /**
           * Enter the type of monitoring service
           */
          name: string
          price: {
            /**
             * Specify if the monitoring service is free or paid
             */
            type: 'free' | 'paid'
            /**
             * Specify the additional cost if paid
             */
            amount?: number | null
          }
          /**
           * Unique identifier for the addon in Contabo
           */
          addonId?: string | null
          id?: string | null
        }[]
      | null
    ssl?:
      | {
          /**
           * Enter the type of SSL certificate
           */
          name: string
          price: {
            /**
             * Specify if the SSL certificate is free or paid
             */
            type: 'free' | 'paid'
            /**
             * Specify the cost of the SSL certificate
             */
            amount?: number | null
            /**
             * Specify whether the charge is one-time or recurring
             */
            chargeType: 'one_time' | 'recurring'
          }
          /**
           * Unique identifier for the addon in Contabo
           */
          addonId?: string | null
          id?: string | null
        }[]
      | null
  }
  /**
   * Auto generated by stripe
   */
  stripeProductId?: string | null
  updatedAt: string
  createdAt: string
}

export interface VpsOrder {
  id: string
  /**
   * Unique instance ID for the VPS
   */
  instanceId?: number | null
  /**
   * Stores the user-submitted data from the frontend
   */
  userData?:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  /**
   * Stores the response received after instance creation in Contabo
   */
  instanceResponse?:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  /**
   * Automatically user will be selected.
   */
  user?: (string | null) | User
  plan: string | VpsPlan
  /**
   * Auto generated by stripe
   */
  stripe_subscription_id?: string | null
  /**
   * Auto generated by stripe
   */
  last_billed_date?: string | null
  /**
   * Auto generated by stripe
   */
  next_billing_date?: string | null
  cancel_at_period_end?: boolean | null
  /**
   * Auto generated by stripe
   */
  subscription_status?: string | null
  /**
   * Auto generated by stripe
   */
  invoice_url?: string | null
  paymentCardId?: string | null
  updatedAt: string
  createdAt: string
}

export interface User {
  id: string
  displayName?: string | null
  username?: string | null
  imageUrl?: (string | null) | Media
  avatarUrl?: string | null
  apiKey?: string | null
  apiKeyIndex?: string | null
  email: string
  resetPasswordToken?: string | null
  resetPasswordExpiration?: string | null
  salt?: string | null
  hash?: string | null
  _verified?: boolean | null
  _verificationToken?: string | null
  loginAttempts?: number | null
  lockUntil?: string | null
  password?: string | null
  wallet?: number | null
  hasClaimedFreeCredits?: boolean | null
}

export interface Card {
  id: string
  name: string
  paymentMethodId: string
  user?: {
    relationTo: 'users'
    value: string | User
  } | null
  updatedAt: string
  createdAt: string
}
