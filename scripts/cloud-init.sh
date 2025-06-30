#!/bin/bash

set -e  # Exit on error

# Arguments
TAILSCALE_AUTH_KEY="$1"
DOKKU_VERSION="$2"

# Log everything to console + file + syslog
exec > >(tee -a /var/log/dflow-bootstrap.log | logger -t dflow-init -s) 2>&1

echo "[+] Installing Tailscale"
curl -fsSL https://tailscale.com/install.sh | sh

echo "[+] Starting Tailscale with tags"
tailscale up \
  --authkey "$TAILSCALE_AUTH_KEY" \
  --ssh \
  --advertise-tags=tag:customer-machine

echo "[+] Installing Dokku $DOKKU_VERSION"
wget -NP . https://dokku.com/bootstrap.sh --inet4-only
sudo DOKKU_TAG="v$DOKKU_VERSION" bash bootstrap.sh

echo "[+] Clearing global Dokku domain"
dokku domains:clear-global

echo "[+] Setting dFlow MOTD"
chmod -x /etc/update-motd.d/* || true

cat << "EOF" > /etc/motd
 __________________
< Welcome To dFlow >
 ------------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||

A lightweight developer PaaS  
powered by Dokku

👉 https://dflow.sh
==========================================
EOF

echo "✅ Setup complete!"
