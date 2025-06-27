#!/bin/sh
set -e

# # Make sure directories exist
# mkdir -p /var/run/tailscale
# mkdir -p /var/lib/tailscale

# Start tailscaled in background
tailscaled --tun=linux --socket=/var/run/tailscale/tailscaled.sock &

# Give tailscaled time to come up
sleep 2

# Join Tailscale as an ephemeral node
tailscale up --authkey="${1}" --hostname "dflow" --accept-dns

# /usr/sbin/sshd
# On container stop, log out of Tailscale
trap 'echo "Logging out of Tailscale..."; tailscale logout; exit 0' TERM INT

# Run your Next.js app
exec node server.js
