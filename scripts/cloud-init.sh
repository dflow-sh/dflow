#!/bin/bash

# dFlow Bootstrap Script
# Sets up Tailscale, Dokku, and dFlow environment

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly LOG_FILE="/var/log/dflow-bootstrap.log"
readonly DOKKU_PLUGINS_DIR="/var/lib/dokku/plugins/available"
readonly MOTD_DIR="/etc/update-motd.d"
readonly MOTD_FILE="/etc/motd"

# Colors for output
readonly PRIMARY='\033[38;2;120;66;242m'
readonly NC='\033[0m' # No Color
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE" >&2
}

cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        log_error "Script failed with exit code $exit_code"
        log_error "Check $LOG_FILE for details"
    fi
    exit $exit_code
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

validate_args() {
    if [[ $# -ne 2 ]]; then
        log_error "Usage: $0 <TAILSCALE_AUTH_KEY> <DOKKU_VERSION>"
        log_error "Example: $0 tskey-auth-xxxxx 0.34.6"
        exit 1
    fi
    
    local auth_key="$1"
    local dokku_version="$2"
    
    if [[ -z "$auth_key" ]]; then
        log_error "Tailscale auth key cannot be empty"
        exit 1
    fi
    
    if [[ -z "$dokku_version" ]]; then
        log_error "Dokku version cannot be empty"
        exit 1
    fi
    
    # Basic version format validation
    if ! [[ "$dokku_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        log_error "Dokku version must be in format X.Y.Z (e.g., 0.34.6)"
        exit 1
    fi
}

install_tailscale() {
    log_info "Installing Tailscale..."
    
    if command -v tailscale &> /dev/null; then
        log_warn "Tailscale is already installed"
        return 0
    fi
    
    if ! curl -fsSL https://tailscale.com/install.sh | sh; then
        log_error "Failed to install Tailscale"
        exit 1
    fi
    
    log_info "Tailscale installed successfully"
}

configure_tailscale() {
    local auth_key="$1"
    
    log_info "Configuring Tailscale with SSH and customer tags..."
    
    if ! tailscale up \
        --authkey "$auth_key" \
        --ssh \
        --advertise-tags=tag:customer-machine; then
        log_error "Failed to configure Tailscale"
        exit 1
    fi
    
    log_info "Tailscale configured successfully"
}

install_dokku() {
    local version="$1"
    
    log_info "Installing Dokku v$version..."
    
    if command -v dokku &> /dev/null; then
        log_warn "Dokku is already installed"
        return 0
    fi
    
    # Download bootstrap script
    if ! wget -NP . https://dokku.com/bootstrap.sh --inet4-only; then
        log_error "Failed to download Dokku bootstrap script"
        exit 1
    fi
    
    # Install Dokku
    if ! DOKKU_TAG="v$version" bash bootstrap.sh; then
        log_error "Failed to install Dokku"
        exit 1
    fi
    
    log_info "Dokku v$version installed successfully"
}

install_dokku_hooks() {
    local hook_source="$SCRIPT_DIR/dokku-predeploy-resource-check.sh"
    local hook_target="$DOKKU_PLUGINS_DIR/pre-deploy/check-resources"
    
    log_info "Installing Dokku pre-deploy resource check hook..."
    
    if [[ ! -f "$hook_source" ]]; then
        log_error "Hook source file not found: $hook_source"
        exit 1
    fi
    
    # Create plugin directory
    mkdir -p "$DOKKU_PLUGINS_DIR/pre-deploy"
    
    # Copy and set permissions
    if ! cp "$hook_source" "$hook_target"; then
        log_error "Failed to copy hook script"
        exit 1
    fi
    
    chmod +x "$hook_target"
    log_info "Dokku hooks installed successfully"
}

configure_dokku() {
    log_info "Configuring Dokku..."
    
    # Clear global domain
    if ! dokku domains:clear-global; then
        log_error "Failed to clear Dokku global domain"
        exit 1
    fi
    
    log_info "Dokku configured successfully"
}

setup_motd() {
    log_info "Setting up dFlow MOTD..."
    
    # Disable existing MOTD scripts
    if [[ -d "$MOTD_DIR" ]]; then
        chmod -x "$MOTD_DIR"/* 2>/dev/null || true
    fi
    
    # Create new MOTD
    cat > "$MOTD_FILE" << 'EOF'
                                                                     
                       ****                       
                     *******                      
                    ********                      
                   +++*****                       
                  ++++++++                        
                +++++++++   ++***                 
                +++++++    +++++**                
              =+++++++   ++++++++                 
             =====+++   ++++++++   ++             
            ========   ++++++++   ++++            
           ========  ===++++++  +++++++           
         =========  =======++  +++++++++          
        ========   ========    +++++++++++        
       ----====   ========   ====++++++++++       
      -------=   ========   ========++++++++      
     ------------======    ========  ==++++++     
   -----------------==-   ========  ======++++    
   ------------------     =======  ==========++   
    ----------------       -==-    ===========    
                                                  
                                                     
                                                  
     ${PRIMARY}█████ ███████████ ████${NC}                          
    ${PRIMARY}░░███ ░░███░░░░░░█░░███${NC}                          
  ${PRIMARY}███████  ░███   █ ░  ░███   ██████  █████ ███ █████${NC}
 ${PRIMARY}███░░███  ░███████    ░███  ███░░███░░███ ░███░░███ ${NC}
${PRIMARY}░███ ░███  ░███░░░█    ░███ ░███ ░███ ░███ ░███ ░███ ${NC}
${PRIMARY}░███ ░███  ░███  ░     ░███ ░███ ░███ ░░███████████  ${NC}
${PRIMARY}░░████████ █████       █████░░██████   ░░████░████   ${NC}
 ${PRIMARY}░░░░░░░░ ░░░░░       ░░░░░  ░░░░░░     ░░░░ ░░░░    ${NC} 

=====================================================
             🚀 Welcome to dFlow! 🚀
          A lightweight developer PaaS  
             powered by ⚙️  Dokku

        🌐 Website:    https://dflow.sh  
        🧪 Dashboard:  https://app.dflow.sh  
=====================================================
EOF
    
    log_info "MOTD configured successfully"
}

main() {
    local tailscale_auth_key="$1"
    local dokku_version="$2"
    
    log_info "Starting dFlow bootstrap process..."
    log_info "Dokku version: $dokku_version"
    log_info "Log file: $LOG_FILE"
    
    # Setup logging
    exec > >(tee -a "$LOG_FILE" | logger -t dflow-init -s) 2>&1
    
    # Run setup steps
    install_tailscale
    configure_tailscale "$tailscale_auth_key"
    install_dokku "$dokku_version"
    install_dokku_hooks
    configure_dokku
    setup_motd
    
    log_info "✅ dFlow bootstrap completed successfully!"
    log_info "System is ready for deployment"
}

# Script execution
trap cleanup EXIT

# Validate environment and arguments
check_root
validate_args "$@"

# Run main function
main "$@"
