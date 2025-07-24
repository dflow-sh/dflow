#!/bin/bash

# Dynamic resource check for Dokku deployments
# This script determines server capacity and checks if resources are available for new services

# Default service resource requirements
DEFAULT_MEM_MB=512
DEFAULT_DISK_GB=2
DEFAULT_CPU_LOAD_PERCENT=80  # 80% of available CPU cores

# Parse command line arguments
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
      echo "Options:"
      echo "  --service-type TYPE    Service type: app, docker, database"
      echo "  --memory MB           Required memory in MB (default: based on service type)"
      echo "  --disk GB             Required disk in GB (default: based on service type)"
      echo "  --cpu-percent PERCENT Max CPU load percentage (default: 80)"
      echo "  -h, --help            Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Set requirements based on service type if not explicitly provided
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
    *)
      echo "Warning: Unknown service type '$SERVICE_TYPE', using defaults"
      ;;
  esac
fi

# Get current server resources
MEM_FREE=$(free -m | awk '/^Mem:/{print $7}')
DISK_FREE=$(df -BG --output=avail / | tail -1 | tr -dc '0-9')
CPU_LOAD=$(cat /proc/loadavg | awk '{print $1}')
CONTAINERS=$(docker ps -q | wc -l 2>/dev/null || echo 0)

# Get total server capacity
TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
TOTAL_DISK=$(df -BG --output=size / | tail -1 | tr -dc '0-9')
CPU_CORES=$(nproc)

# Calculate dynamic limits
MAX_CPU_LOAD=$(echo "scale=2; $CPU_CORES * $MAX_CPU_LOAD_PERCENT / 100" | bc)

# Dynamic container limit based on total memory
# Assuming each container needs at least 128MB on average
AVG_CONTAINER_MEM=128
MAX_CONTAINERS_THEORY=$(echo "$TOTAL_MEM / $AVG_CONTAINER_MEM" | bc)
# Use 80% of theoretical max for safety
MAX_CONTAINERS=$(echo "scale=0; $MAX_CONTAINERS_THEORY * 0.8" | bc | cut -d'.' -f1)

# Ensure minimum values
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

# Check if server has enough resources
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

# Check CPU load using bc for float comparison
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
  echo "Consider:"
  echo "  - Stopping unused containers"
  echo "  - Upgrading server resources"
  echo "  - Cleaning up disk space"
  exit 1
fi

echo "✅ Resource check passed. Server can handle new service deployment."
echo ""
exit 0
