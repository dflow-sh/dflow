import axios from 'axios'
import { env } from 'env'

const traefik = axios.create({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? `http://localhost:4000`
      : `https://dflow-traefik.${env.NEXT_PUBLIC_PROXY_DOMAIN_URL}`,
  headers: {
    // todo: add JWT authorization
  },
})

export default traefik
