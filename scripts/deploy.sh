#!/bin/bash

# Production deployment script for FamTodo
set -e

echo "🚀 Starting FamTodo production deployment..."

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production.local"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    
    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file $ENV_FILE not found."
        log_info "Please copy .env.production to $ENV_FILE and configure it."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Generate secrets if needed
generate_secrets() {
    log_info "Checking for required secrets..."
    
    ENV_TEMP=$(mktemp)
    cp "$ENV_FILE" "$ENV_TEMP"
    
    # Generate JWT secret if missing
    if grep -q "CHANGE_ME_SECURE_JWT_SECRET" "$ENV_TEMP"; then
        JWT_SECRET=$(openssl rand -hex 32)
        sed -i "s/CHANGE_ME_SECURE_JWT_SECRET_32_CHARS_MINIMUM/$JWT_SECRET/g" "$ENV_TEMP"
        log_info "Generated JWT secret"
    fi
    
    # Generate NextAuth secret if missing
    if grep -q "CHANGE_ME_SECURE_NEXTAUTH_SECRET" "$ENV_TEMP"; then
        NEXTAUTH_SECRET=$(openssl rand -hex 32)
        sed -i "s/CHANGE_ME_SECURE_NEXTAUTH_SECRET_32_CHARS_MINIMUM/$NEXTAUTH_SECRET/g" "$ENV_TEMP"
        log_info "Generated NextAuth secret"
    fi
    
    # Generate database password if missing
    if grep -q "CHANGE_ME_SECURE_PASSWORD" "$ENV_TEMP"; then
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        sed -i "s/CHANGE_ME_SECURE_PASSWORD/$DB_PASSWORD/g" "$ENV_TEMP"
        log_info "Generated database password"
    fi
    
    # Generate encryption key if missing
    if grep -q "your_encryption_key_32_chars_minimum" "$ENV_TEMP"; then
        ENC_KEY=$(openssl rand -hex 32)
        sed -i "s/your_encryption_key_32_chars_minimum/$ENC_KEY/g" "$ENV_TEMP"
        log_info "Generated database encryption key"
    fi
    
    # Generate secret key base if missing
    if grep -q "your_secret_key_base_64_chars_minimum" "$ENV_TEMP"; then
        SECRET_KEY_BASE=$(openssl rand -hex 64)
        sed -i "s/your_secret_key_base_64_chars_minimum/$SECRET_KEY_BASE/g" "$ENV_TEMP"
        log_info "Generated secret key base"
    fi
    
    mv "$ENV_TEMP" "$ENV_FILE"
    log_success "Secrets configuration completed"
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    
    mkdir -p nginx/conf.d
    mkdir -p ssl
    mkdir -p logs
    mkdir -p backups
    
    log_success "Directories created"
}

# Build and deploy
deploy() {
    log_info "Building and deploying services..."
    
    # Set compose command
    COMPOSE_CMD="docker-compose"
    if command -v docker &> /dev/null && docker compose version &> /dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    fi
    
    # Build images
    log_info "Building Docker images..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" build --no-cache
    
    # Start services
    log_info "Starting services..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_health
    
    log_success "Deployment completed successfully!"
}

# Check service health
check_health() {
    log_info "Checking service health..."
    
    # Check database
    if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U famtodo_user -d famtodo_prod; then
        log_success "Database is healthy"
    else
        log_error "Database health check failed"
        return 1
    fi
    
    # Check web application
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        log_success "Web application is healthy"
    else
        log_warning "Web application health check failed, but deployment continued"
    fi
    
    # Show running services
    docker-compose -f "$COMPOSE_FILE" ps
}

# Backup existing data
backup() {
    if [ "$1" = "--backup" ]; then
        log_info "Creating backup before deployment..."
        
        BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        # Backup database if it exists
        if docker-compose -f "$COMPOSE_FILE" ps postgres | grep -q Up; then
            log_info "Backing up database..."
            docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U famtodo_user famtodo_prod > "$BACKUP_DIR/database.sql"
            log_success "Database backup created: $BACKUP_DIR/database.sql"
        fi
        
        # Backup uploads if they exist
        if [ -d "uploads" ]; then
            log_info "Backing up uploads..."
            cp -r uploads "$BACKUP_DIR/"
            log_success "Uploads backup created: $BACKUP_DIR/uploads"
        fi
    fi
}

# Show help
show_help() {
    echo "FamTodo Production Deployment Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --backup          Create backup before deployment"
    echo "  --help           Show this help message"
    echo "  --logs           Show service logs"
    echo "  --stop           Stop all services"
    echo "  --restart        Restart all services"
    echo "  --status         Show service status"
    echo ""
}

# Show logs
show_logs() {
    log_info "Showing service logs..."
    docker-compose -f "$COMPOSE_FILE" logs -f
}

# Stop services
stop_services() {
    log_info "Stopping all services..."
    docker-compose -f "$COMPOSE_FILE" down
    log_success "All services stopped"
}

# Restart services
restart_services() {
    log_info "Restarting all services..."
    docker-compose -f "$COMPOSE_FILE" restart
    log_success "All services restarted"
}

# Show status
show_status() {
    log_info "Service status:"
    docker-compose -f "$COMPOSE_FILE" ps
}

# Main execution
main() {
    case "$1" in
        --help)
            show_help
            ;;
        --logs)
            show_logs
            ;;
        --stop)
            stop_services
            ;;
        --restart)
            restart_services
            ;;
        --status)
            show_status
            ;;
        *)
            backup "$1"
            check_prerequisites
            generate_secrets
            create_directories
            deploy
            ;;
    esac
}

# Run main function with all arguments
main "$@"