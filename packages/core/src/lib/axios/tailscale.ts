import axios from 'axios'

const tailscale = axios.create({
  baseURL: 'https://api.tailscale.com/api/v2',
})

export default tailscale
