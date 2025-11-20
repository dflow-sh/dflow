import axios from 'axios'
import { env } from 'env'

const traefik = axios.create({
  baseURL: `https://dflow-traefik.${env.NEXT_PUBLIC_PROXY_DOMAIN_URL}`,
  headers: {
    // todo: add JWT authorization
  },
})

export default traefik
