export interface Config {
  auth: {
    users: UserAuthOperations
  }
  blocks: {}
  collections: {
    users: User
    templates: Template
  }
  collectionsJoins: {}
  collectionsSelect: {
    templates: TemplatesSelect<false> | TemplatesSelect<true>
  }
  db: {
    defaultIDType: string
  }
  globals: {
    github: Github
  }
  globalsSelect: {
    github: GithubSelect<false> | GithubSelect<true>
  }
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

export interface TemplatesSelect<T extends boolean = true> {
  name?: T
  description?: T
  imageUrl?: T
  services?:
    | T
    | {
        name?: T
        description?: T
        type?: T
        providerType?: T
        githubSettings?:
          | T
          | {
              repository?: T
              owner?: T
              branch?: T
              buildPath?: T
              port?: T
            }
        azureSettings?:
          | T
          | {
              repository?: T
              branch?: T
              owner?: T
              buildPath?: T
              port?: T
            }
        giteaSettings?:
          | T
          | {
              repository?: T
              branch?: T
              owner?: T
              buildPath?: T
              port?: T
            }
        gitlabSettings?:
          | T
          | {
              repository?: T
              branch?: T
              owner?: T
              buildPath?: T
              port?: T
            }
        bitbucketSettings?:
          | T
          | {
              repository?: T
              owner?: T
              branch?: T
              buildPath?: T
              port?: T
            }
        databaseDetails?:
          | T
          | {
              type?: T
              exposedPorts?: T
            }
        dockerDetails?:
          | T
          | {
              url?: T
              ports?:
                | T
                | {
                    hostPort?: T
                    containerPort?: T
                    scheme?: T
                    id?: T
                  }
            }
        builder?: T
        volumes?:
          | T
          | {
              hostPath?: T
              containerPath?: T
              id?: T
            }
        variables?:
          | T
          | {
              key?: T
              value?: T
              id?: T
            }
        id?: T
      }
  user?: T
  type?: T
  updatedAt?: T
  createdAt?: T
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

export interface GithubSelect<T extends boolean = true> {
  githubStars?: T
  issues?: T
  releases?: T
  updatedAt?: T
  createdAt?: T
  globalType?: T
}

export interface User {
  id: string
  displayName?: string | null
  username?: string | null
  type?: ('individual' | 'organization') | null
  personalDetails?: {
    firstName?: string | null
    lastName?: string | null
    jobTitle?: string | null
  }
  organizationDetails?: {
    companyName?: string | null
    contactPerson?: string | null
    jobTitle?: string | null
  }
  contactDetails?: {
    phoneNumber?: number | null
    alternatePhone?: number | null
    website?: string | null
  }
  addressDetails?: {
    addressLine1?: string | null
    addressLine2?: string | null
    city?: string | null
    state?: string | null
    postalCode?: number | null
    country?: string | null
  }
  additionalDetails?: {
    referralSource?:
      | (
          | 'google'
          | 'social'
          | 'referral'
          | 'ad'
          | 'youtube'
          | 'blog'
          | 'linkedin'
          | 'reddit'
          | 'other'
        )
      | null
    referralSourceOther?: string | null
    message?: string | null
  }
  imageUrl?: string | null
  avatarUrl?: string | null
  role: ('admin' | 'author' | 'user')[]
  emailVerified?: string | null
  discord?: {
    accountId?: string | null
    username?: string | null
    globalName?: string | null
    discriminator?: string | null
    avatarUrl?: string | null
    isEligible?: boolean | null
    accountCreationDate?: string | null
    accountAge?: number | null
  }
  /**
   * Whether the user has claimed their free credits
   */
  hasClaimedFreeCredits?: boolean | null
  /**
   * Time at which user accepted terms & conditions
   */
  acceptedTermsDate?: string | null
  stripe_customer_code?: string | null
  wallet?: number | null
  updatedAt: string
  createdAt: string
  enableAPIKey?: boolean | null
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
}
