#!/bin/sh
set -e

# # Make sure directories exist
# mkdir -p /var/run/tailscale
# mkdir -p /var/lib/tailscale

# Start tailscaled in background
tailscaled --tun=userspace-networking --socks5-server=0.0.0.0:1055 --state=/var/lib/tailscale/tailscaled.state &

# Give tailscaled time to come up
sleep 2

# Join Tailscale as an ephemeral node
tailscale up --authkey="${1}" --hostname "railway-container" --accept-dns

/usr/sbin/sshd
# On container stop, log out of Tailscale
trap 'echo "Logging out of Tailscale..."; tailscale logout; exit 0' TERM INT

# Run your Next.js app
exec node server.js
