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
tailscale up --authkey="${TAILSCALE_AUTH_KEY}" --hostname "dflow" --accept-dns

# /usr/sbin/sshd
# On container stop, log out of Tailscale
trap 'echo "Logging out of Tailscale..."; tailscale logout; exit 0' TERM INT

readonly PRIMARY='\033[38;2;120;66;242m'
readonly NC='\033[0m'

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
    '             🚀 Welcome to dFlow! 🚀' \
    '          A lightweight developer PaaS  ' \
    '             powered by ⚙️  Dokku' \
    '' \
    '        🌐 Website:    https://dflow.sh  ' \
    '        🧪 Dashboard:  https://app.dflow.sh  '
    printf '%b\n' \
    '====================================================='
}

tailscale status | awk '
{
  status = ($NF == "-" ? "online" : "offline")
  if ($2 ~ /^vmi/) {
    dflow[status]++
  } else if ($2 ~ /^dfi/) {
    custom[status]++
  }
}
END {
  printf "\ndFlow servers:\n"
  printf "🟢 Online devices:  %d\n", dflow["online"] + 0
  printf "🔴 Offline devices: %d\n", dflow["offline"] + 0

  printf "\ncustom servers:\n"
  printf "🟢 Online devices:  %d\n", custom["online"] + 0
  printf "🔴 Offline devices: %d\n", custom["offline"] + 0
}'


# 🔁 Replace placeholders in built output
# These fail if unset (because of `set -euo pipefail` if added at the top)
NEXT_PUBLIC_DISCORD_INVITE_URL="${NEXT_PUBLIC_DISCORD_INVITE_URL}"
NEXT_PUBLIC_WEBSITE_URL="${NEXT_PUBLIC_WEBSITE_URL}"
NEXT_PUBLIC_PROXY_DOMAIN_URL="${NEXT_PUBLIC_PROXY_DOMAIN_URL}"
NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN="${NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN}"
NEXT_PUBLIC_BETTER_STACK_INGESTING_URL="${NEXT_PUBLIC_BETTER_STACK_INGESTING_URL}"
NEXT_PUBLIC_PROXY_CNAME="${NEXT_PUBLIC_PROXY_CNAME}"

# 🪄 Replace values in built static files
find apps/web/.next -type f -exec sed -i "s~__NEXT_PUBLIC_DISCORD_INVITE_URL__~${NEXT_PUBLIC_DISCORD_INVITE_URL}~g" {} +
find apps/web/.next -type f -exec sed -i "s~__NEXT_PUBLIC_WEBSITE_URL__~${NEXT_PUBLIC_WEBSITE_URL}~g" {} +
find apps/web/.next -type f -exec sed -i "s~__NEXT_PUBLIC_PROXY_DOMAIN_URL__~${NEXT_PUBLIC_PROXY_DOMAIN_URL}~g" {} +
find apps/web/.next -type f -exec sed -i "s~__NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN__~${NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN}~g" {} +
find apps/web/.next -type f -exec sed -i "s~https://s1.eu.betterstackdata.com~${NEXT_PUBLIC_BETTER_STACK_INGESTING_URL}~g" {} +
find apps/web/.next -type f -exec sed -i "s~__NEXT_PUBLIC_PROXY_CNAME__~${NEXT_PUBLIC_PROXY_CNAME}~g" {} +

# Run your Next.js app
if [ -f "apps/web/server.js" ]; then
  exec node apps/web/server.js
elif [ -f "server.js" ]; then
  exec node server.js
else
  echo "server.js not found in standard locations. Searching..."
  SERVER_JS_FILE=$(find . -name "server.js" ! -path "*/node_modules/*" | head -n 1)

  if [ -n "$SERVER_JS_FILE" ]; then
    echo "Found server.js at $SERVER_JS_FILE"
    exec node "$SERVER_JS_FILE"
  else
    echo "Could not find server.js. Listing current directory:"
    ls -R
    exit 1
  fi
fi
