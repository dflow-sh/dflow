#!/bin/bash

set -e  # Exit on error

# Log everything to console + file + syslog
exec > >(tee -a /var/log/dflow-bootstrap.log | logger -t dflow-init -s) 2>&1

echo "[+] Installing Dokku v0.35.20"
wget -NP . https://dokku.com/bootstrap.sh --inet4-only
DOKKU_TAG="v0.35.20"
sudo DOKKU_TAG=$DOKKU_TAG bash bootstrap.sh

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
