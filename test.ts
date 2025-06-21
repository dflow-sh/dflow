import { NodeSSH } from 'node-ssh'

const ssh = new NodeSSH()

await ssh.connect({
  host: 'vmi2666999',
  username: 'root',
})

await ssh.execCommand('dokku apps:list', {
  onStdout: async chunk => {
    console.log(chunk.toString())
  },
  onStderr: async chunk => {
    console.log(chunk.toString())
  },
})
