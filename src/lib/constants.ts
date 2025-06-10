export const supportedLinuxVersions = ['11', '12', '20.04', '22.04', '24.04']

export const supportedDokkuVersion = '0.35.15'

export const awsRegions = [
  // { label: 'US East (N. Virginia)', value: 'us-east-1' },
  // { label: 'US East (Ohio)', value: 'us-east-2' },
  // { label: 'US West (N. California)', value: 'us-west-1' },
  // { label: 'US West (Oregon)', value: 'us-west-2' },
  // { label: 'Africa (Cape Town)', value: 'af-south-1' },
  // { label: 'Asia Pacific (Hong Kong)', value: 'ap-east-1' },
  // { label: 'Asia Pacific (Hyderabad)', value: 'ap-south-2' },
  // { label: 'Asia Pacific (Jakarta)', value: 'ap-southeast-3' },
  // { label: 'Asia Pacific (Malaysia)', value: 'ap-southeast-5' },
  // { label: 'Asia Pacific (Melbourne)', value: 'ap-southeast-4' },
  { label: 'Asia Pacific (Mumbai)', value: 'ap-south-1' },
  // { label: 'Asia Pacific (Osaka)', value: 'ap-northeast-3' },
  // { label: 'Asia Pacific (Seoul)', value: 'ap-northeast-2' },
  // { label: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
  // { label: 'Asia Pacific (Sydney)', value: 'ap-southeast-2' },
  // { label: 'Asia Pacific (Thailand)', value: 'ap-southeast-7' },
  // { label: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
  // { label: 'Canada (Central)', value: 'ca-central-1' },
  // { label: 'Canada West (Calgary)', value: 'ca-west-1' },
  // { label: 'Europe (Frankfurt)', value: 'eu-central-1' },
  // { label: 'Europe (Ireland)', value: 'eu-west-1' },
  // { label: 'Europe (London)', value: 'eu-west-2' },
  // { label: 'Europe (Milan)', value: 'eu-south-1' },
  // { label: 'Europe (Paris)', value: 'eu-west-3' },
  // { label: 'Europe (Spain)', value: 'eu-south-2' },
  // { label: 'Europe (Stockholm)', value: 'eu-north-1' },
  // { label: 'Europe (Zurich)', value: 'eu-central-2' },
  // { label: 'Israel (Tel Aviv)', value: 'il-central-1' },
  // { label: 'Mexico (Central)', value: 'mx-central-1' },
  // { label: 'Middle East (Bahrain)', value: 'me-south-1' },
  // { label: 'Middle East (UAE)', value: 'me-central-1' },
  // { label: 'South America (São Paulo)', value: 'sa-east-1' },
] as const

export const amiList = [
  {
    label: 'Ubuntu Server 24.04 LTS',
    value: 'ami-0e35ddab05955cf57',
  },
] as const

export const instanceTypes = [
  {
    label: 't3.micro (2 vCPUs, 1 GiB RAM)',
    value: 't3.micro',
  },
  {
    label: 't3.small (2 vCPUs, 2 GiB RAM)',
    value: 't3.small',
  },
  {
    label: 't3.medium (2 vCPUs, 4 GiB RAM)',
    value: 't3.medium',
  },
  {
    label: 't3.large (2 vCPUs, 8 GiB RAM)',
    value: 't3.large',
  },
  {
    label: 't3.xlarge (4 vCPUs, 16 GiB RAM)',
    value: 't3.xlarge',
  },
  {
    label: 'c5.xlarge (4 vCPUs, 8 GiB RAM)',
    value: 'c5.xlarge',
  },
] as const

export const numberRegex = /^\d+$/
export const REFERENCE_VARIABLE_REGEX = /\${{\s*(\w+):([\w-]+)\.([\w_]+)\s*}}/
export const TEMPLATE_EXPR = /\{\{\s*(.*?)\s*\}\}/g

export const posthogHost = 'https://us.i.posthog.com'
export const posthogKey = 'phc_CkZ9XejPwdsrmxUl0Pmp0n3fRUioTekrpBS1lnzuGOn'

export const databaseOptions = [
  {
    label: 'Postgres',
    value: 'postgres',
  },
  {
    label: 'MongoDB',
    value: 'mongo',
  },
  {
    label: 'MySQL',
    value: 'mysql',
  },
  {
    label: 'Redis',
    value: 'redis',
  },
  {
    label: 'MariaDB',
    value: 'mariadb',
  },
]

export const DFLOW_CONFIG = {
  URL: 'https://dflow.sh',
  AUTH_SLUG: 'users',
}

export const WILD_CARD_DOMAINS = ['nip.io', 'sslip.io']
