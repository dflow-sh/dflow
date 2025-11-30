#!/bin/sh

set -e

readonly PRIMARY='\033[38;2;120;66;242m'
readonly NC='\033[0m'
readonly PURPLE='\033[1;35m'
readonly GRAY='\033[1;90m'
readonly BOLD='\033[1m'


prompt_with_default() {
  local var_name=$1
  local prompt_text=$2
  local current_value="${!var_name}"

  if [ -n "$current_value" ]; then
    prompt="$prompt_text [${current_value}]: "
  else
    prompt="$prompt_text "
  fi

  # Print prompt and read input from TTY
  printf "%b" "$prompt"
  read input < /dev/tty

  # Update variable using indirect reference
  eval "$var_name=\"\${input:-\$current_value}\""
}

confirm_or_abort() {
  local prompt_text=$1

  printf "%b" "$prompt_text"
  read answer < /dev/tty
  if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
    exit 1
  fi
}

{
    printf '%b\n' \
    '                                                  ' \
    '                       ****                       ' \
    '                     *******                      ' \
    '                    ********                      ' \
    '                   +++*****                       ' \
    '                  ++++++++                        ' \
    '                +++++++++   ++***                 ' \
    '                +++++++    +++++**                ' \
    '              =+++++++   ++++++++                 ' \
    '             =====+++   ++++++++   ++             ' \
    '            ========   ++++++++   ++++            ' \
    '           ========  ===++++++  +++++++           ' \
    '         =========  =======++  +++++++++          ' \
    '        ========   ========    +++++++++++        ' \
    '       ----====   ========   ====++++++++++       ' \
    '      -------=   ========   ========++++++++      ' \
    '     ------------======    ========  ==++++++     ' \
    '   -----------------==-   ========  ======++++    ' \
    '   ------------------     =======  ==========++   ' \
    '    ----------------       -==-    ===========    ' \
    '                                                  ' \
    "     ${PRIMARY}█████ ███████████ ████${NC}                          " \
    "    ${PRIMARY}░░███ ░░███░░░░░░█░░███${NC}                          " \
    "  ${PRIMARY}███████  ░███   █ ░  ░███   ██████  █████ ███ █████${NC}" \
    " ${PRIMARY}███░░███  ░███████    ░███  ███░░███░░███ ░███░░███${NC} " \
    "${PRIMARY}░███ ░███  ░███░░░█    ░███ ░███ ░███ ░███ ░███ ░███${NC} " \
    "${PRIMARY}░███ ░███  ░███  ░     ░███ ░███ ░███ ░░███████████${NC}  " \
    "${PRIMARY}░░████████ █████       █████░░██████   ░░████░████${NC}   " \
    " ${PRIMARY}░░░░░░░░ ░░░░░       ░░░░░  ░░░░░░     ░░░░ ░░░░${NC}    " \
    '' \
    '=====================================================' \
    '        🚀 Welcome dFlow self-host setup 🚀' \
    '        🌐 Website:    https://dflow.sh  ' \
    '=====================================================' \
    ''
}

if [ -f .env ]; then
  set -a
  . .env
  set +a
  printf ""
fi

if [ "$(id -u)" -ne 0 ]; then
  echo "❌ This script must be run as root (try using: sudo $0)"
  exit 1
fi

printf "${PURPLE}⛓️  Tailscale setup${NC}\n"
printf "${GRAY}Sign-up for a free account at https://tailscale.com${NC}\n\n"

printf "Access Control:\n"
printf "${GRAY}▬ Go to Access Control tab, select JSON Editor option paste the configuration: https://github.com/dflow-sh/dflow/blob/main/TAILSCALE.md ${NC}\n"
confirm_or_abort "Have you updated the Access Control settings? [y/n]:"
printf "\n"

printf "Enter your Tailnet name:\n"
printf "${GRAY}▬ You can find your Tailnet name in the top header after logging in, example: ${BOLD}johndoe.github${NC}\n"
prompt_with_default "TAILSCALE_TAILNET" ">"
printf "\n"

printf "Enter your Auth key:\n"
printf "${GRAY}▬ Go to settings tab, under personal settings tab you'll find Keys option click on that!${NC}\n"
printf "${GRAY}▬ Click Generate auth key, check Reusable & Ephemeral option's and create key. example: tskey-auth-xxxxxxxx-xxxxxxxxx${NC}\n"
prompt_with_default "TAILSCALE_AUTH_KEY" ">"
printf "\n"

printf "Enter your OAuth key:\n"
printf "${GRAY}▬ Go to settings tab, under tailnet settings tab you'll find OAuth clients option click on that!${NC}\n"
printf "${GRAY}▬ Click Generate OAuth client, check read option for ALL scopes & check write option for Auth Keys scope, select tag:customer-machine create client. example: tskey-client-xxxxxxx-xxxxxxx${NC}\n"
prompt_with_default "TAILSCALE_OAUTH_CLIENT_SECRET" ">"
printf "\n"

# 2. Ask for Traefik user email
printf "${PURPLE}✉️  Email configuration${NC}\n"
printf "${GRAY}▬ Enter your email, this will be used for SSL Certificate generation${NC}\n"
prompt_with_default "TRAEFIK_EMAIL" ">"
printf "\n"

# 3. Ask for custom domain (optional)
printf "${PURPLE}🌐 Domain configuration${NC}\n"
printf "${GRAY}▬ Add a DNS record for routing, Type A, Name: *.up, Value: <your-server-ip>, Proxy: OFF${NC}\n"
printf "${GRAY}▬ Enter your domain, example: up.johndeo.com${NC}\n"
prompt_with_default "WILD_CARD_DOMAIN" ">"
printf "\n"

if [ -z "$WILD_CARD_DOMAIN" ]; then
  WILD_CARD_DOMAIN="up.$(curl -s https://api.ipify.org).nip.io"
  printf "✅ Using default domain: $WILD_CARD_DOMAIN\n\n"
fi

# 4. Ask for JWT secret
printf "${PURPLE}🔑 JWT configuration${NC}\n"
printf "${GRAY}▬ Note: JWT Secret will be used for Authentication & Encryption${NC}\n"
printf "${GRAY}▬ Enter your JWT, keep a strong secret it shouldn't be changed between deployments ${NC}\n"
prompt_with_default "PAYLOAD_SECRET" ">"
printf "\n"

if [ -z "$PAYLOAD_SECRET" ]; then
  PAYLOAD_SECRET=$(openssl rand -base64 32)
  printf "✅ Generated default JWT: $PAYLOAD_SECRET\n\n"
fi


# 5. Create .env file
cat <<EOF > .env
# mongodb
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password
MONGO_DB_NAME=dFlow

# redis
REDIS_URI="redis://redis:6379"

# config-generator
WILD_CARD_DOMAIN="$WILD_CARD_DOMAIN"
JWT_TOKEN="$PAYLOAD_SECRET"
PROXY_PORT=9999

# dFlow app
NEXT_PUBLIC_WEBSITE_URL=dflow.$WILD_CARD_DOMAIN
DATABASE_URI=mongodb://$MONGO_INITDB_ROOT_USERNAME:$MONGO_INITDB_ROOT_PASSWORD@mongodb:27017/${MONGO_DB_NAME}?authSource=admin
PAYLOAD_SECRET="$PAYLOAD_SECRET"

NEXT_PUBLIC_PROXY_DOMAIN_URL="$WILD_CARD_DOMAIN"
NEXT_PUBLIC_PROXY_CNAME=cname.$WILD_CARD_DOMAIN

# tailscale
TAILSCALE_AUTH_KEY="$TAILSCALE_AUTH_KEY"
TAILSCALE_OAUTH_CLIENT_SECRET="$TAILSCALE_OAUTH_CLIENT_SECRET"
TAILSCALE_TAILNET="$TAILSCALE_TAILNET"

BESZEL_KEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAOxrWddjHETJ7MMTIUqFXGoLv3WuKlHRd6whux7nVSz"
BESZEL_TOKEN=""

TRAEFIK_EMAIL="$TRAEFIK_EMAIL"

# optional integrations
CF_DNS_API_TOKEN=""

NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN=""
NEXT_PUBLIC_BETTER_STACK_INGESTING_URL=""

NEXT_PUBLIC_DISCORD_INVITE_URL=""

RESEND_SENDER_EMAIL=""
RESEND_SENDER_NAME=""
RESEND_API_KEY=""

S3_ACCESS_KEY_ID=""
S3_ENDPOINT=""
S3_REGION=""
S3_SECRET_ACCESS_KEY=""
EOF
printf "📄 Created .env file\n"

# 5. Create acme.json with permissions
touch acme.json
chmod 600 acme.json
printf "📁 Created acme.json for storing SSL Certificates\n"

# 6. Create traefik configuration files
cat <<EOF > traefik.yaml
entryPoints:
  web:
    address: ':80'
  websecure:
    address: ':443'
providers:
  file:
    directory: /etc/traefik/dynamic
    watch: true
certificatesResolvers:
  letsencrypt:
    acme:
      email: $TRAEFIK_EMAIL
      storage: /etc/traefik/acme.json
      httpChallenge:
        entryPoint: web # Used for app-specific domains
api:
  dashboard: false
  insecure: false # ⚠️ Secure this in production
log:
  level: INFO
EOF

mkdir -p dynamic
cat <<EOF > dynamic/dflow-app.yaml
http:
  routers:
    dflow-app-router:
      rule: "Host(\`dflow.${WILD_CARD_DOMAIN}\`)"
      entryPoints:
        - websecure
      tls:
        certResolver: letsencrypt
      service: dflow-app-service
  services:
    dflow-app-service:
      loadBalancer:
        servers:
          - url: http://payload-app:3000
EOF


cat <<EOF > dynamic/dflow-traefik.yaml
http:
  routers:
    dflow-traefik-router:
      rule: "Host(\`dflow-traefik.${WILD_CARD_DOMAIN}\`)"
      entryPoints:
        - websecure
      tls:
        certResolver: letsencrypt
      service: dflow-traefik-service
  services:
    dflow-traefik-service:
      loadBalancer:
        servers:
          - url: http://config-generator:9999
EOF

cat <<EOF > dynamic/dflow-beszel.yaml
http:
  routers:
    dflow-beszel-router:
      rule: "Host(\`monitoring.${WILD_CARD_DOMAIN}\`)"
      entryPoints:
        - websecure
      tls:
        certResolver: letsencrypt
      service: dflow-beszel-service
  services:
    dflow-beszel-service:
      loadBalancer:
        servers:
          - url: http://beszel:8090
EOF
printf "📁 Created traefik configuration in dynamic folder\n"

# 6. Create docker-compose.yml
if curl -fsSL https://raw.githubusercontent.com/dflow-sh/dflow/refs/heads/main/docker-compose.yml -o docker-compose.yaml; then
  printf "📁 Created docker-compose.yaml\n"
else
  printf "⚠️ Failed to download docker-compose.yaml, please check your internet connection or download manually."
  exit 1
fi
printf "\n"


if [ -f .env ]; then
  set -a
  . .env
  set +a
fi

printf "${PURPLE}🚀 Next Steps${NC}\n"

if command -v docker >/dev/null 2>&1; then
  DOCKER_VERSION=$(docker --version)
  printf "%b\n" "▬ Run: ${BOLD}docker compose --env-file .env -p dflow up -d${NC}\n"
else
  printf "%b\n" "▬ Docker is not installed!\n"
  printf "%b\n" "${GRAY}Install Docker, with single command, curl -fsSL https://get.docker.com/ | sh${NC}\n"
  printf "%b\n" "▬ After installation run: ${BOLD}docker compose --env-file .env -p dflow up -d${NC}\n"
fi
