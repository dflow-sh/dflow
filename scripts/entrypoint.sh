#!/bin/sh
set -e

# Start Tailscale
tailscaled --tun=userspace-networking --socks5-server=0.0.0.0:1055 &

# Give tailscaled time to come up
sleep 2

# Join Tailscale as an ephemeral node
tailscale up --authkey="${TAILSCALE_AUTH_KEY}" --hostname "railway-container"
# On container stop, log out of Tailscale
trap 'echo "Logging out of Tailscale..."; tailscale logout; exit 0' TERM INT

# Run your Next.js app
exec node server.js
