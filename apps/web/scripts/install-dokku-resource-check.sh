#!/bin/bash

# Installation script for Dokku Resource Check Plugin
# Version 0.1.3 - Fixed command execution and installation issues

set -e

echo "🔧 Installing Dokku Resource Check Plugin..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script must be run as root"
    exit 1
fi

# Check if dokku is installed
if ! command -v dokku &> /dev/null; then
    echo "❌ Dokku is not installed on this system"
    exit 1
fi

# Plugin details
PLUGIN_NAME="resource-check"
PLUGIN_DIR="/var/lib/dokku/plugins/available/$PLUGIN_NAME"
HOOKS_DIR="$PLUGIN_DIR/plugin"
COMMANDS_DIR="$PLUGIN_DIR/commands"

# Clean up previous installation
echo "🧹 Cleaning up previous installation..."
dokku plugin:uninstall "$PLUGIN_NAME" &>/dev/null || true
rm -rf "$PLUGIN_DIR"

# Create plugin directory structure
echo "📦 Creating plugin directories..."
mkdir -p "$HOOKS_DIR"
mkdir -p "$COMMANDS_DIR"

# Create plugin.toml
echo "📝 Creating plugin metadata..."
cat > "$PLUGIN_DIR/plugin.toml" <<EOF
[plugin]
description = "Checks server resources before allowing create operations"
version = "0.1.3"
[plugin.config]
EOF

# Create the resource check command
echo "📋 Installing resource check command..."
cat > "$COMMANDS_DIR/resource-check" <<'SCRIPT_EOF'
#!/bin/bash

# Dynamic resource check for Dokku deployments
DEFAULT_MEM_MB=512
DEFAULT_DISK_GB=2
DEFAULT_CPU_LOAD_PERCENT=80

SERVICE_TYPE=""
REQUIRED_MEM_MB=$DEFAULT_MEM_MB
REQUIRED_DISK_GB=$DEFAULT_DISK_GB
MAX_CPU_LOAD_PERCENT=$DEFAULT_CPU_LOAD_PERCENT

while [[ $# -gt 0 ]]; do
  case $1 in
    --service-type)
      SERVICE_TYPE="$2"
      shift 2
      ;;
    --memory)
      REQUIRED_MEM_MB="$2"
      shift 2
      ;;
    --disk)
      REQUIRED_DISK_GB="$2"
      shift 2
      ;;
    --cpu-percent)
      MAX_CPU_LOAD_PERCENT="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: dokku resource-check [OPTIONS]"
      echo "Options:"
      echo "  --service-type TYPE    Type of service (app, database, docker)"
      echo "  --memory MB            Required memory in MB"
      echo "  --disk GB              Required disk space in GB"
      echo "  --cpu-percent PERCENT  Maximum CPU load percentage allowed"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

if [ -n "$SERVICE_TYPE" ]; then
  case $SERVICE_TYPE in
    app)
      [ "$REQUIRED_MEM_MB" -eq "$DEFAULT_MEM_MB" ] && REQUIRED_MEM_MB=512
      [ "$REQUIRED_DISK_GB" -eq "$DEFAULT_DISK_GB" ] && REQUIRED_DISK_GB=2
      ;;
    docker)
      [ "$REQUIRED_MEM_MB" -eq "$DEFAULT_MEM_MB" ] && REQUIRED_MEM_MB=256
      [ "$REQUIRED_DISK_GB" -eq "$DEFAULT_DISK_GB" ] && REQUIRED_DISK_GB=1
      ;;
    database)
      [ "$REQUIRED_MEM_MB" -eq "$DEFAULT_MEM_MB" ] && REQUIRED_MEM_MB=1024
      [ "$REQUIRED_DISK_GB" -eq "$DEFAULT_DISK_GB" ] && REQUIRED_DISK_GB=5
      ;;
  esac
fi

MEM_FREE=$(free -m | awk '/^Mem:/{print $7}')
DISK_FREE=$(df -BG --output=avail / | tail -1 | tr -dc '0-9')
CPU_LOAD=$(cat /proc/loadavg | awk '{print $1}')
CONTAINERS=$(docker ps -q | wc -l 2>/dev/null || echo 0)

TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
TOTAL_DISK=$(df -BG --output=size / | tail -1 | tr -dc '0-9')
CPU_CORES=$(nproc)

MAX_CPU_LOAD=$(echo "scale=2; $CPU_CORES * $MAX_CPU_LOAD_PERCENT / 100" | bc)

AVG_CONTAINER_MEM=128
MAX_CONTAINERS_THEORY=$(echo "$TOTAL_MEM / $AVG_CONTAINER_MEM" | bc)
MAX_CONTAINERS=$(echo "scale=0; $MAX_CONTAINERS_THEORY * 0.8" | bc | cut -d'.' -f1)

[ "$MAX_CONTAINERS" -lt 5 ] && MAX_CONTAINERS=5

echo "=== Server Resource Check ==="
echo "Server Capacity:"
echo "  Memory: ${MEM_FREE}MB available / ${TOTAL_MEM}MB total"
echo "  Disk: ${DISK_FREE}GB available / ${TOTAL_DISK}GB total"
echo "  CPU: ${CPU_LOAD} load / ${CPU_CORES} cores (max allowed: ${MAX_CPU_LOAD})"
echo "  Containers: ${CONTAINERS} running (max estimated: ${MAX_CONTAINERS})"
echo ""
echo "Service Requirements:"
echo "  Memory: ${REQUIRED_MEM_MB}MB"
echo "  Disk: ${REQUIRED_DISK_GB}GB"
echo "  Service Type: ${SERVICE_TYPE:-"default"}"
echo ""

FAILED=0

if [ "$MEM_FREE" -lt "$REQUIRED_MEM_MB" ]; then
  echo "❌ FAILED: Not enough memory to deploy new service"
  echo "   Required: ${REQUIRED_MEM_MB}MB, Available: ${MEM_FREE}MB"
  FAILED=1
fi

if [ "$DISK_FREE" -lt "$REQUIRED_DISK_GB" ]; then
  echo "❌ FAILED: Not enough disk space to deploy new service"
  echo "   Required: ${REQUIRED_DISK_GB}GB, Available: ${DISK_FREE}GB"
  FAILED=1
fi

CPU_LOAD_HIGH=$(echo "$CPU_LOAD > $MAX_CPU_LOAD" | bc -l)
if [ "$CPU_LOAD_HIGH" -eq 1 ]; then
  echo "❌ FAILED: CPU load too high to deploy new service"
  echo "   Max allowed: ${MAX_CPU_LOAD}, Current: ${CPU_LOAD}"
  FAILED=1
fi

if [ "$CONTAINERS" -ge "$MAX_CONTAINERS" ]; then
  echo "❌ FAILED: Server at container capacity"
  echo "   Max estimated: ${MAX_CONTAINERS}, Current: ${CONTAINERS}"
  FAILED=1
fi

if [ "$FAILED" -eq 1 ]; then
  echo ""
  echo "🚫 Resource check failed. Cannot deploy new service."
  exit 1
fi

echo "✅ Resource check passed. Server can handle new service deployment."
echo ""
exit 0
SCRIPT_EOF

chmod +x "$COMMANDS_DIR/resource-check"

# Create the pre-create hook
echo "🔍 Installing pre-create hook..."
cat > "$HOOKS_DIR/pre-create" <<'HOOK_EOF'
#!/bin/bash

set -eo pipefail
[ -n "$DOKKU_TRACE" ] && set -x

get_service_requirements() {
    local cmd="$1"
    local service_type=""
    local memory_mb=""
    local disk_gb=""
    
    case "$cmd" in
        "apps:create")
            service_type="app"
            memory_mb=512
            disk_gb=2
            ;;
        "postgres:create"|"postgresql:create")
            service_type="database"
            memory_mb=1024
            disk_gb=5
            ;;
        "mysql:create")
            service_type="database"
            memory_mb=1024
            disk_gb=5
            ;;
        "mongodb:create"|"mongo:create")
            service_type="database"
            memory_mb=1024
            disk_gb=8
            ;;
        "redis:create")
            service_type="database"
            memory_mb=256
            disk_gb=1
            ;;
        *)
            service_type="docker"
            memory_mb=512
            disk_gb=2
            ;;
    esac
    
    echo "$service_type $memory_mb $disk_gb"
}

is_create_operation() {
    local cmd="$1"
    echo "$cmd" | grep -qE ":(create|new)$|^apps:create$"
}

get_service_name() {
    local args=("$@")
    echo "${args[1]:-unknown}"
}

main() {
    local cmd="$1"
    shift
    local args=("$@")
    
    if is_create_operation "$cmd"; then
        echo "🔍 Dokku Resource Check Plugin: Checking resources for $cmd operation"
        
        local requirements=($(get_service_requirements "$cmd"))
        local service_type="${requirements[0]}"
        local memory_mb="${requirements[1]}"
        local disk_gb="${requirements[2]}"
        local service_name=$(get_service_name "${args[@]}")
        
        echo "📋 Service Details:"
        echo "   Name: $service_name"
        echo "   Type: $service_type"
        echo "   Memory Required: ${memory_mb}MB"
        echo "   Disk Required: ${disk_gb}GB"
        echo ""
        
        echo "⚡ Running pre-deployment resource check..."
        if ! dokku resource-check --service-type "$service_type" --memory "$memory_mb" --disk "$disk_gb"; then
            echo ""
            echo "🚫 CREATE OPERATION BLOCKED: Insufficient server resources"
            echo "   Command: dokku $cmd ${args[*]}"
            echo "   Service: $service_name ($service_type)"
            echo ""
            exit 1
        fi
        echo ""
        
        echo "✅ Resource check passed. Proceeding with creation..."
    fi
}

main "$@"
HOOK_EOF

chmod +x "$HOOKS_DIR/pre-create"

# Enable the plugin
echo "🔌 Enabling plugin..."
dokku plugin:enable "$PLUGIN_NAME"

echo ""
echo "🎉 Plugin installation completed successfully!"
echo "The resource check will now run automatically before any create operations."
echo ""
echo "You can manually run a check with: dokku resource-check [options]"
