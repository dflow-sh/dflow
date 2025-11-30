import * as fs from 'fs'
import { NodeSSH, SSHExecOptions } from 'node-ssh'
import * as path from 'path'

export const deployWithNginx = async (
  ssh: NodeSSH,
  domain: string,
  sshHost: string,
  port: number = 3000,
  options?: SSHExecOptions,
) => {
  // Generate docker-compose content for Nginx setup
  const composeContent = `
version: '3'

services:
  wetty:
    image: wettyoss/wetty:latest
    command: --ssh-host=${sshHost}
    restart: unless-stopped
    ports:
      - "${port}:3000"
`

  // Create Nginx config for WeTTY
  const nginxConfig = `
server {
    listen 80;
    server_name ${domain};

    location / {
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`

  // Create temporary files
  const tempComposePath = path.join('/tmp', `wetty-compose-${Date.now()}.yml`)
  const tempNginxPath = path.join('/tmp', `wetty-nginx-${Date.now()}.conf`)

  // Write files locally
  fs.writeFileSync(tempComposePath, composeContent)
  fs.writeFileSync(tempNginxPath, nginxConfig)

  // Upload files to server
  await ssh.putFile(tempComposePath, '/tmp/docker-compose.yml')
  await ssh.putFile(tempNginxPath, '/tmp/wetty-nginx.conf')

  // Deploy the docker-compose file
  const composeResult = await ssh.execCommand(
    'docker-compose -f /tmp/docker-compose.yml up -d',
    options,
  )

  if (composeResult.code === 1) {
    throw new Error(composeResult.stderr)
  }

  // Copy Nginx config to sites-available
  await ssh.execCommand(
    'sudo cp /tmp/wetty-nginx.conf /etc/nginx/sites-available/wetty.conf',
    options,
  )

  // Create symlink to sites-enabled
  await ssh.execCommand(
    'sudo ln -sf /etc/nginx/sites-available/wetty.conf /etc/nginx/sites-enabled/',
    options,
  )

  // Test Nginx config
  const testResult = await ssh.execCommand('sudo nginx -t', options)

  if (testResult.code === 1) {
    throw new Error(testResult.stderr)
  }

  // Reload Nginx
  const reloadResult = await ssh.execCommand(
    'sudo systemctl reload nginx',
    options,
  )

  // Clean up temporary files
  fs.unlinkSync(tempComposePath)
  fs.unlinkSync(tempNginxPath)

  if (reloadResult.code === 1) {
    throw new Error(reloadResult.stderr)
  }

  return {
    composeResult,
    testResult,
    reloadResult,
  }
}
