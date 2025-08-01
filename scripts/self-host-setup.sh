#!/bin/sh

set -e

readonly PRIMARY='\033[38;2;120;66;242m'
readonly NC='\033[0m'
readonly CYAN='\033[1;35m'
readonly GRAY='\033[1;90m'
readonly BOLD='\033[1m'


prompt_with_default() {
  var_name=$1
  prompt_text=$2
  current_value=$(eval echo \$$var_name)

  if [ -n "$current_value" ]; then
    prompt="$prompt_text [${current_value}]: "
  else
    prompt="$prompt_text "
  fi

  read -p "$prompt" input
  eval "$var_name=\"\${input:-\$current_value}\""
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
  . ./.env
  set +a
  echo ""
fi

echo "${CYAN}Tailscale setup${NC}"
echo "${GRAY}Sign-up for a free account at https://tailscale.com${NC} \n"

echo "Enter your Tailnet name"
echo "${GRAY}▬ You can find your Tailnet name in the top header after logging in, example: ${BOLD}johndoe.github${NC}"
prompt_with_default "TAILSCALE_TAILNET" ">"
echo ""

echo "Enter your Auth key:"
echo "${GRAY}▬ Go to settings tab, under personal settings tab you'll find Keys option click on that!${NC}"
echo "${GRAY}▬ Click Generate auth key, check Reusable & Ephemeral option's and create key${NC}"
prompt_with_default "TAILSCALE_AUTH_KEY" ">"
echo ""

echo "Enter your OAuth key:"
echo "${GRAY}▬ Go to settings tab, under tailnet settings tab you'll find OAuth clients option click on that!${NC}"
echo "${GRAY}▬ Click Generate OAuth client, check read option for ALL scopes & check write write option for Auth Keys scope and create client${NC}"
prompt_with_default "TAILSCALE_OAUTH_CLIENT_SECRET" ">"
echo ""

# 2. Ask for Traefik user email
echo "${CYAN}Email configuration${NC}"
echo "${GRAY}▬ Enter your email, this will'be used for SSL Certificate generation${NC}"
prompt_with_default "TRAEFIK_EMAIL" ">"

echo ""

# 3. Ask for custom domain (optional)
echo "${CYAN}Domain configuration${NC}"
echo "${GRAY}▬ Add a DNS record for routing, Type A, Name: *.up, Value: <your-server-ip>, Proxy: OFF${NC}"
echo "${GRAY}▬ Enter your domain, example: up.johndeo.com${NC}"
prompt_with_default "WILD_CARD_DOMAIN" ">"

echo ""

if [ -z "$WILD_CARD_DOMAIN" ]; then
  WILD_CARD_DOMAIN="up.$(curl -s https://api.ipify.org).nip.io"
  echo "✅ Using default domain: $WILD_CARD_DOMAIN"
fi


# 4. Create .env file
cat <<EOF > .env
# mongodb
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password
MONGO_DB_NAME=dFlow

# redis
REDIS_URI="redis://redis:6379"

# config-generator
WILD_CARD_DOMAIN=$WILD_CARD_DOMAIN
JWT_TOKEN=your-jwt-token
PROXY_PORT=9999

# dFlow app
NEXT_PUBLIC_WEBSITE_URL=dflow.$WILD_CARD_DOMAIN
DATABASE_URI=mongodb://$MONGO_INITDB_ROOT_USERNAME:$MONGO_INITDB_ROOT_PASSWORD@mongodb:27017/${MONGO_DB_NAME}?authSource=admin
PAYLOAD_SECRET=your-secret

NEXT_PUBLIC_PROXY_DOMAIN_URL=$WILD_CARD_DOMAIN
NEXT_PUBLIC_PROXY_CNAME=cname.$WILD_CARD_DOMAIN

# tailscale
TAILSCALE_AUTH_KEY=$TAILSCALE_AUTH_KEY
TAILSCALE_OAUTH_CLIENT_SECRET=$TAILSCALE_OAUTH_CLIENT_SECRET
TAILSCALE_TAILNET=$TAILSCALE_TAILNET

BESZEL_KEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAOxrWddjHETJ7MMTIUqFXGoLv3WuKlHRd6whux7nVSz"
BESZEL_TOKEN=""

TRAEFIK_EMAIL=$TRAEFIK_EMAIL
EOF
echo "📄 Created .env file"

# 5. Create acme.json with permissions
touch acme.json
chmod 600 acme.json
echo "📁 Created acme.json for storing SSL Certificates"

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
echo "📁 Created traefik configuration in dynamic folder"

# 6. Create docker-compose.yml
curl -fsSL https://raw.githubusercontent.com/dflow-sh/dflow/refs/heads/main/docker-compose.yml -o docker-compose.yaml
echo "📁 Created docker-compose.yaml"
echo ""


source .env
echo "${CYAN}🚀 Next Steps${NC}"

if command -v docker >/dev/null 2>&1; then
  DOCKER_VERSION=$(docker --version)
  echo "▬ Run: ${BOLD}docker compose --env-file .env up -d${NC}"
else
  echo "▬ Docker is not installed!"
  echo "${GRAY}Install Docker, with single command, curl -fsSL https://get.docker.com/ | sh${NC}"
  echo "▬ After installation run: ${BOLD}docker compose --env-file .env up -d${NC}"
fi
