import { DFLOW_CONFIG } from "@core/lib/constants"
import { PayloadSDK } from '@payloadcms/sdk'

import { Config } from "@core/lib/restSDK/types"

export const dFlowRestSdk = new PayloadSDK<Config>({
  baseURL: `${DFLOW_CONFIG.URL}/api`,
})
