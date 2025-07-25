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

    # Print Tailscale device count here
    tailscale status | awk '{ s=($NF=="-" ? "online" : "offline"); count[s]++ } END { printf "\n        🟢 Online devices:  %d\n        🔴 Offline devices: %d\n", count["online"], count["offline"] }'

    printf '%b\n' \
    '====================================================='
}

# Run your Next.js app
exec node server.js
