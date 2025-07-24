# Create the installation script
cat > install-dokku-interceptor.sh << 'EOF'
#!/bin/bash

# Installation script for Dokku Create Operations Interceptor
# This script sets up the interceptor to check resources before any dokku create command

set -e

echo "🔧 Installing Dokku Create Operations Interceptor..."

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

# Backup original dokku binary if not already done
if [ ! -f "/usr/bin/dokku.original" ]; then
    echo "📦 Backing up original dokku binary..."
    cp /usr/bin/dokku /usr/bin/dokku.original
    chmod +x /usr/bin/dokku.original
    echo "✅ Original dokku binary backed up to /usr/bin/dokku.original"
else
    echo "ℹ️  Original dokku binary already exists at /usr/bin/dokku.original"
fi

# Install the resource check script
echo "📋 Installing resource check script..."
cat > /usr/local/bin/dokku-predeploy-resource-check.sh << 'SCRIPT_EOF'
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
      echo "Usage: $0 [OPTIONS]"
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

chmod +x /usr/local/bin/dokku-predeploy-resource-check.sh
echo "✅ Resource check script installed"

# Install the interceptor script
echo "🔍 Installing Dokku interceptor..."
cat > /usr/bin/dokku << 'INTERCEPTOR_EOF'
#!/bin/bash

ORIGINAL_DOKKU="/usr/bin/dokku.original"
RESOURCE_CHECK_SCRIPT="/usr/local/bin/dokku-predeploy-resource-check.sh"

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
        echo "🔍 Intercepted Dokku create operation: $cmd"
        
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
        
        if [ -f "$RESOURCE_CHECK_SCRIPT" ]; then
            echo "⚡ Running pre-deployment resource check..."
            if ! "$RESOURCE_CHECK_SCRIPT" --service-type "$service_type" --memory "$memory_mb" --disk "$disk_gb"; then
                echo ""
                echo "🚫 CREATE OPERATION BLOCKED: Insufficient server resources"
                echo "   Command: dokku $cmd ${args[*]}"
                echo "   Service: $service_name ($service_type)"
                echo ""
                echo "💡 To override this check, use: dokku.original $cmd ${args[*]}"
                exit 1
            fi
            echo ""
        fi
        
        echo "✅ Resource check passed. Proceeding with creation..."
        echo "🚀 Executing: dokku $cmd ${args[*]}"
        echo ""
    fi
    
    exec "$ORIGINAL_DOKKU" "$cmd" "${args[@]}"
}

main "$@"
INTERCEPTOR_EOF

chmod +x /usr/bin/dokku
echo "✅ Dokku interceptor installed"

echo ""
echo "🎉 Installation completed successfully!"
echo ""
EOF

# Make it executable
chmod +x install-dokku-interceptor.sh
