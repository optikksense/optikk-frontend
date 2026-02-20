#!/bin/bash

# ObserveX React Frontend - Development Server Startup Script
# Connects to local backend on localhost:8080

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Helper functions
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_header() { echo -e "${PURPLE}$1${NC}"; }

clear

print_header "╔════════════════════════════════════════════════════════════╗"
print_header "║                                                            ║"
print_header "║        ObserveX React Frontend - Development Mode         ║"
print_header "║                                                            ║"
print_header "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
print_info "Checking prerequisites..."
echo ""

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo ""
    echo "Install Node.js:"
    echo "  macOS:   brew install node"
    echo "  Ubuntu:  sudo apt install nodejs npm"
    echo "  Windows: Download from https://nodejs.org"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js installed: $NODE_VERSION"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm installed: $NPM_VERSION"

echo ""

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found!"
    echo ""
    echo "Make sure you're in the observability-frontend-react directory:"
    echo "  cd observability-frontend-react"
    echo "  ./start-dev.sh"
    echo ""
    exit 1
fi

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies (this may take a few minutes)..."
    echo ""
    npm install
    echo ""
    print_success "Dependencies installed successfully!"
    echo ""
fi

# Check if backend is running
print_info "Checking backend connection..."
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    print_success "Backend is running at http://localhost:8080"
else
    print_warning "Backend is not running at http://localhost:8080"
    echo ""
    echo "The frontend will start, but API calls will fail until the backend is running."
    echo ""
    echo "To start the backend:"
    echo "  cd observability-backend"
    echo "  mvn spring-boot:run -Dspring-boot.run.profiles=local"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
print_header "╔════════════════════════════════════════════════════════════╗"
print_header "║              Starting Development Server...                ║"
print_header "╚════════════════════════════════════════════════════════════╝"
echo ""

print_info "Configuration:"
echo "  • Frontend:  http://localhost:3000"
echo "  • Backend:   http://localhost:8080"
echo "  • Proxy:     /api → http://localhost:8080/api"
echo ""

print_info "Features:"
echo "  ✨ Hot Module Replacement (HMR)"
echo "  ✨ React Fast Refresh"
echo "  ✨ Automatic backend proxy"
echo "  ✨ Source maps for debugging"
echo ""

print_success "Starting Vite development server..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start the dev server
npm run dev

