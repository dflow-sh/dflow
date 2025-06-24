import { createSSH } from '@/lib/tailscale/ssh'

// const ssh = new NodeSSH()

// await ssh.connect({
//   host: 'vmi2666999',
//   username: 'root',
// })

export const ssh = await createSSH('dokku-master', 'root')

await ssh.execCommand('dokku apps:list', {
  onStdout: async chunk => {
    console.log(chunk.toString())
  },
  onStderr: async chunk => {
    console.log(chunk.toString())
  },
})

ssh.dispose()
