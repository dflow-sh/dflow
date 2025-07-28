import { NodeSSH } from 'node-ssh'
import payload from 'payload'

interface Args {
  ssh: NodeSSH
}

// extracting all values by executing an single command
const parseSSHOutput = (stdout: string) => {
  const sections = stdout.split(/---([A-Z_]+)---\s*/).slice(1) // split and remove first empty part
  const parsed: Record<string, string> = {}

  for (let i = 0; i < sections.length; i += 2) {
    const key = sections[i]
    const value = sections[i + 1]?.trim()
    if (value?.startsWith('---')) continue // skip accidental mis-parse
    parsed[key] = value
  }

  // Extract specific fields

  let linuxDistributionType: string | null = null
  let linuxDistributionVersion: string | null = null

  const lsbLines = parsed['LSB_RELEASE']?.split('\n') ?? []
  for (const line of lsbLines) {
    if (line.startsWith('Distributor ID:')) {
      linuxDistributionType = line.split(':')[1]?.trim() ?? null
    }
    if (line.startsWith('Release:')) {
      linuxDistributionVersion = line.split(':')[1]?.trim() ?? null
    }
  }

  const extractedDokkuVersion = parsed['DOKKU_VERSION']?.split('\n')[0] ?? ''
  const extractedRailpackVersion =
    parsed['RAILPACK_VERSION']?.split('\n')[0] ?? ''
  const extractedNetdataVersion =
    parsed['NETDATA_VERSION']?.split('\n')[0] ?? ''

  const dokkuVersion = extractedDokkuVersion.split(' ')?.at(-1)
  const railpackVersion = extractedRailpackVersion.split(' ')?.at(-1)
  const netdataVersion = extractedNetdataVersion.split(' ')?.at(-1)

  return {
    netdataVersion,
    linuxDistributionType,
    linuxDistributionVersion,
    dokkuVersion,
    railpackVersion,
  }
}

const command = `
(
  echo "---NETDATA_VERSION---"
  netdata -v 2>/dev/null || true

  echo "---LSB_RELEASE---"
  lsb_release -a 2>/dev/null || true

  echo "---DOKKU_VERSION---"
  dokku version 2>/dev/null || true

  echo "---RAILPACK_VERSION---"
  sudo railpack --version 2>/dev/null || true
)
`

export const serverInfo = async ({ ssh }: Args) => {
  const resultServerInfo = await ssh.execCommand(command)
  return parseSSHOutput(resultServerInfo.stdout)
}

export const getServerById = async (id: string) => {
  // Adjust this logic as needed for your context
  const server = await payload.findByID({
    collection: 'servers',
    id,
  })
  return server
}
