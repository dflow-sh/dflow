import { DFLOW_CONFIG } from '../constants'
import { PayloadSDK } from '@payloadcms/sdk'

import { Config } from './types'

export const dFlowRestSdk = new PayloadSDK<Config>({
  baseURL: `${DFLOW_CONFIG.URL}/api`,
})
