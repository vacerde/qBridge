#!/bin/bash

# qBridge Terminal Window Manager
# Advanced development environment with real-time monitoring and control

# Parse command line arguments
DEBUG_MODE=false
VERBOSE_MODE=false
PRODUCTION_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
    --debug)
        DEBUG_MODE=true
        VERBOSE_MODE=true
        shift
        ;;
    --verbose | -v)
        VERBOSE_MODE=true
        shift
        ;;
    --production | -p)
        PRODUCTION_MODE=true
        shift
        ;;
    --help | -h)
        echo "qBridge Terminal Window Manager"
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "OPTIONS:"
        echo "  --debug      Enable debug mode with detailed logging"
        echo "  --verbose    Enable verbose output"
        echo "  --production Run in production mode (build + start)"
        echo "  --help       Show this help message"
        exit 0
        ;;
    *)
        echo "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
    esac
done

# Set bash options more carefully
if [[ $DEBUG_MODE == true ]]; then
    set -x # Enable command tracing in debug mode
    exec 2> >(tee -a /tmp/qBridge_debug.log >&2)
    echo "DEBUG: Debug mode enabled, logging to /tmp/qBridge_debug.log"
fi

# Don't use set -e initially to prevent early exits
set -uo pipefail

# Color definitions for beautiful output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly GRAY='\033[0;90m'
readonly BOLD='\033[1m'
readonly NC='\033[0m' # No Color
readonly RESET='\033[0m'

# Terminal control sequences
readonly CLEAR='\033[2J'
readonly HOME='\033[H'
readonly SAVE_CURSOR='\033[s'
readonly RESTORE_CURSOR='\033[u'
readonly HIDE_CURSOR='\033[?25l'
readonly SHOW_CURSOR='\033[?25h'

# Global variables
SCREEN_WIDTH=$(tput cols 2>/dev/null || echo 80)
SCREEN_HEIGHT=$(tput lines 2>/dev/null || echo 24)
FRONTEND_PID=""
BACKEND_PID=""
DB_CONTAINER_ID=""
WORKSPACE_CONTAINER_ID=""
CURRENT_SCREEN="main"
REFRESH_RATE=1.0 # Increased to 1 second for better readability
KEYBIND_HISTORY=()
MAX_HISTORY=10
CLEANUP_CALLED=false
SERVICES_STARTED=false
INITIAL_DRAW=true
PAUSED=false

# Log tracking variables
FRONTEND_LOG_SIZE=0
BACKEND_LOG_SIZE=0
RESOURCE_UPDATE_COUNTER=0

# Temporary files for capturing logs
FRONTEND_LOG="/tmp/qBridge_frontend.log"
BACKEND_LOG="/tmp/qBridge_backend.log"
RESOURCE_LOG="/tmp/qBridge_resources.log"
DEBUG_LOG="/tmp/qBridge_debug.log"

# Debug and logging functions
debug_log() {
    if [[ $DEBUG_MODE == true ]]; then
        echo "[DEBUG $(date '+%H:%M:%S')] $*" | tee -a "$DEBUG_LOG" >&2
    fi
}

verbose_log() {
    if [[ $VERBOSE_MODE == true ]]; then
        echo "[INFO $(date '+%H:%M:%S')] $*" >&2
    fi
}

error_log() {
    echo "[ERROR $(date '+%H:%M:%S')] $*" | tee -a "$DEBUG_LOG" >&2
}

# Safe command execution with error handling
safe_execute() {
    local cmd="$1"
    local description="$2"

    debug_log "Executing: $cmd"
    verbose_log "$description"

    if eval "$cmd" 2>/dev/null; then
        debug_log "SUCCESS: $description"
        return 0
    else
        local exit_code=$?
        error_log "FAILED: $description (exit code: $exit_code)"
        return $exit_code
    fi
}

# Cleanup function
cleanup() {
    if [[ $CLEANUP_CALLED == true ]]; then
        debug_log "Cleanup already called, skipping"
        return 0
    fi

    CLEANUP_CALLED=true
    debug_log "Starting cleanup process"

    echo -e "${SHOW_CURSOR}"
    tput sgr0 2>/dev/null || true
    clear

    if [[ $SERVICES_STARTED == true ]]; then
        echo "Shutting down qBridge services..."

        # Enhanced frontend cleanup
        if [[ -n "$FRONTEND_PID" ]]; then
            verbose_log "Stopping frontend process tree (PID: $FRONTEND_PID)"
            
            # Kill entire process group
            if kill -0 "$FRONTEND_PID" 2>/dev/null; then
                # Send TERM signal to process group
                kill -TERM -$FRONTEND_PID 2>/dev/null || true
                
                # Give it time to shut down gracefully
                sleep 3
                
                # Force kill if still running
                if kill -0 "$FRONTEND_PID" 2>/dev/null; then
                    kill -KILL -$FRONTEND_PID 2>/dev/null || true
                fi
            fi
            
            # Additional cleanup for Next.js processes
            pkill -f "next-router-worker" 2>/dev/null || true
            pkill -f "next dev" 2>/dev/null || true
            pkill -f "npm run dev" 2>/dev/null || true
        fi

        # Enhanced backend cleanup
        if [[ -n "$BACKEND_PID" ]]; then
            verbose_log "Stopping backend process tree (PID: $BACKEND_PID)"
            
            if kill -0 "$BACKEND_PID" 2>/dev/null; then
                # Kill process group
                kill -TERM -$BACKEND_PID 2>/dev/null || true
                sleep 2
                
                # Force kill if needed
                if kill -0 "$BACKEND_PID" 2>/dev/null; then
                    kill -KILL -$BACKEND_PID 2>/dev/null || true
                fi
            fi
        fi


        verbose_log "Stopping Docker containers"
        docker stop qBridge-db qBridge-mongo 2>/dev/null || true
        docker rm qBridge-db qBridge-mongo 2>/dev/null || true
    fi

    verbose_log "Cleaning up temporary files"
    if [[ $DEBUG_MODE != true ]]; then
        rm -f "$FRONTEND_LOG" "$BACKEND_LOG" "$RESOURCE_LOG" "$DEBUG_LOG" 2>/dev/null || true
    fi

    debug_log "Cleanup completed successfully"
    echo "qBridge shutdown complete."

    if [[ $DEBUG_MODE == true ]]; then
        echo "Debug log saved to: $DEBUG_LOG"
    fi
}


# Additional helper function for emergency port cleanup
emergency_port_cleanup() {
    local port=$1
    verbose_log "Emergency cleanup for port $port"
    
    # Find all processes using the port
    local pids=$(ss -tlnp 2>/dev/null | grep ":$port " | grep -o 'pid=[0-9]*' | cut -d'=' -f2 | sort -u || true)
    
    if [[ -n "$pids" ]]; then
        verbose_log "Found processes on port $port: $pids"
        for pid in $pids; do
            if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
                verbose_log "Force killing PID $pid on port $port"
                kill -KILL "$pid" 2>/dev/null || true
            fi
        done
    fi
    
    # Alternative method using netstat if ss is not available
    if command -v netstat >/dev/null 2>&1; then
        local netstat_pids=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1 | grep -v '-' || true)
        if [[ -n "$netstat_pids" ]]; then
            for pid in $netstat_pids; do
                if [[ -n "$pid" ]] && [[ "$pid" =~ ^[0-9]+$ ]] && kill -0 "$pid" 2>/dev/null; then
                    verbose_log "Netstat found PID $pid on port $port, killing"
                    kill -KILL "$pid" 2>/dev/null || true
                fi
            done
        fi
    fi
}

# Set up signal handlers - be more specific about when to cleanup
trap 'debug_log "Received SIGINT"; cleanup; exit 130' SIGINT
trap 'debug_log "Received SIGTERM"; cleanup; exit 143' SIGTERM

# Only set EXIT trap after services are started to avoid early cleanup
set_exit_trap() {
    trap 'debug_log "Script exiting"; cleanup' EXIT
}

# Utility functions
check_dependencies() {
    local missing_deps=()

    debug_log "Checking dependencies"

    for cmd in docker npm; do
        if ! command -v "$cmd" &>/dev/null; then
            missing_deps+=("$cmd")
            debug_log "Missing dependency: $cmd"
        else
            debug_log "Found dependency: $cmd"
        fi
    done

    # Check for docker daemon
    if ! docker info >/dev/null 2>&1; then
        error_log "Docker daemon is not running"
        echo -e "${RED}Error: Docker daemon is not running${NC}"
        echo "Please start Docker and try again."
        return 1
    fi

    # Check for required directories
    if [[ ! -d "./backend" ]]; then
        error_log "Backend directory not found"
        echo -e "${RED}Error: ./backend directory not found${NC}"
        return 1
    fi

    if [[ ! -d "./frontend" ]]; then
        error_log "Frontend directory not found"
        echo -e "${RED}Error: ./frontend directory not found${NC}"
        return 1
    fi

    if [[ ! -f "./backend/run.sh" ]]; then
        error_log "Backend run script not found"
        echo -e "${RED}Error: ./backend/run.sh not found${NC}"
        return 1
    fi

    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        error_log "Missing dependencies: ${missing_deps[*]}"
        echo -e "${RED}Error: Missing dependencies: ${missing_deps[*]}${NC}"
        echo "Please install the missing dependencies before running this script."
        return 1
    fi

    debug_log "All required dependencies found"
    return 0
}

# Docker utilities
container_running() {
    local container_name="$1"
    debug_log "Checking if container '$container_name' is running"

    if docker ps --format "{{.Names}}" 2>/dev/null | grep -q "^$container_name$"; then
        debug_log "Container '$container_name' is running"
        return 0
    else
        debug_log "Container '$container_name' is not running"
        return 1
    fi
}

get_container_id() {
    local container_name="$1"
    debug_log "Getting container ID for '$container_name'"

    local container_id=$(docker ps --format "{{.ID}} {{.Names}}" 2>/dev/null | grep "$container_name" | cut -d' ' -f1)
    debug_log "Container ID for '$container_name': $container_id"
    echo "$container_id"
}

# Service management
start_database() {
    debug_log "Starting database service"

    # Remove existing container if it exists
    docker rm -f qBridge-db 2>/dev/null || true

    verbose_log "Starting PostgreSQL database..."

    if safe_execute "docker run --name qBridge-db \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_DB=qBridge \
        -p 5432:5432 \
        -d postgres:14" "Start PostgreSQL container"; then

        verbose_log "Waiting for database to be ready..."
        local retry_count=0
        local max_retries=15

        while ! docker exec qBridge-db pg_isready -U postgres >/dev/null 2>&1; do
            sleep 1
            ((retry_count++))
            debug_log "Database readiness check attempt $retry_count/$max_retries"

            if [[ $retry_count -ge $max_retries ]]; then
                error_log "Database failed to become ready after $max_retries seconds"
                return 1
            fi
        done

        debug_log "Database is ready"
    else
        error_log "Failed to start database container"
        return 1
    fi

    DB_CONTAINER_ID=$(get_container_id "qBridge-db")
    debug_log "Database container ID: $DB_CONTAINER_ID"
    return 0
}

start_backend() {
    debug_log "Starting backend service"

    # Clear backend log
    >"$BACKEND_LOG"

    # Change to backend directory and start the service
    cd ./backend || {
        error_log "Failed to change to backend directory"
        return 1
    }

    # Make run.sh executable
    chmod +x run.sh 2>/dev/null || true

    # Start backend service in background and capture output
    verbose_log "Starting backend with ./run.sh"
    nohup ./run.sh >>"$BACKEND_LOG" 2>&1 &
    BACKEND_PID=$!

    # Return to original directory
    cd - >/dev/null

    # Verify backend is starting
    sleep 2
    if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        verbose_log "Backend started successfully (PID: $BACKEND_PID)"
        return 0
    else
        error_log "Backend failed to start or exited immediately"
        return 1
    fi
}

start_frontend() {
    debug_log "Starting frontend service"

    # Clear frontend log
    >"$FRONTEND_LOG"

    # Change to frontend directory
    cd ./frontend || {
        error_log "Failed to change to frontend directory"
        return 1
    }

    if [[ $PRODUCTION_MODE == true ]]; then
        verbose_log "Starting frontend in production mode (build + start)"
        # Install dependencies if needed
        if [[ ! -d "node_modules" ]]; then
            verbose_log "Installing frontend dependencies..."
            npm install >>"$FRONTEND_LOG" 2>&1
        fi

        # Build and start
        verbose_log "Building frontend..."
        npm run build >>"$FRONTEND_LOG" 2>&1

        verbose_log "Starting production server..."
        # Start in new process group so we can kill the entire tree
        setsid nohup npm run start >>"$FRONTEND_LOG" 2>&1 &
        FRONTEND_PID=$!
    else
        verbose_log "Starting frontend in development mode"
        # Install dependencies if needed
        if [[ ! -d "node_modules" ]]; then
            verbose_log "Installing frontend dependencies..."
            npm install >>"$FRONTEND_LOG" 2>&1
        fi

        # Kill any existing Next.js processes on port 3000 before starting
        local EXISTING_PIDS=$(lsof -ti tcp:3000 2>/dev/null || true)
        if [[ -n "$EXISTING_PIDS" ]]; then
            verbose_log "Killing existing processes on port 3000: $EXISTING_PIDS"
            for PID in $EXISTING_PIDS; do
                kill -KILL "$PID" 2>/dev/null || true
            done
            sleep 2
        fi

        # Start development server in new process group
        setsid nohup npm run dev >>"$FRONTEND_LOG" 2>&1 &
        FRONTEND_PID=$!
    fi

    # Return to original directory
    cd - >/dev/null

    # Verify frontend is starting
    sleep 3
    if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        verbose_log "Frontend started successfully (PID: $FRONTEND_PID)"
        return 0
    else
        error_log "Frontend failed to start or exited immediately"
        return 1
    fi
}
# Resource monitoring
get_system_resources() {
    local cpu_usage="N/A"
    local memory_info
    local memory_used="N/A"
    local memory_total="N/A"
    local disk_usage="N/A"

    # Get CPU usage (Linux)
    if command -v top >/dev/null 2>&1; then
        cpu_usage=$(top -bn1 2>/dev/null | grep "Cpu(s)" 2>/dev/null | awk '{print $2}' | sed 's/%us,//' || echo "N/A")
    fi

    # Get memory info
    if command -v free >/dev/null 2>&1; then
        memory_info=$(free -h 2>/dev/null | grep "Mem:" || echo "")
        if [[ -n "$memory_info" ]]; then
            memory_used=$(echo $memory_info | awk '{print $3}')
            memory_total=$(echo $memory_info | awk '{print $2}')
        fi
    fi

    # Get disk usage
    if command -v df >/dev/null 2>&1; then
        disk_usage=$(df -h / 2>/dev/null | tail -1 | awk '{print $5}' || echo "N/A")
    fi

    cat <<EOF >"$RESOURCE_LOG"
CPU Usage: ${cpu_usage}
Memory: $memory_used / $memory_total
Disk Usage: $disk_usage
Uptime: $(uptime 2>/dev/null | awk '{print $3,$4}' | sed 's/,//' || echo "N/A")
Load Average: $(uptime 2>/dev/null | awk -F'load average:' '{print $2}' || echo "N/A")
Docker Status: $(docker info >/dev/null 2>&1 && echo "Running" || echo "Stopped")
Active Containers: $(docker ps --quiet 2>/dev/null | wc -l || echo "0")
Network Ports: 3000 (Frontend), 5432 (Database), 9000 (Workspace)
EOF
}

# UI Drawing functions - Only draw when needed
draw_header() {
    tput cup 0 0
    printf "${BOLD}${BLUE}╔"
    printf "═%.0s" $(seq 1 $((SCREEN_WIDTH - 2)))
    printf "╗${NC}\n"

    tput cup 1 0
    local title="🚀 QBRIDGE DEVELOPMENT PLATFORM 🚀"
    local padding=$(((SCREEN_WIDTH - ${#title} + 7) / 2)) # +7 for emoji width compensation
    printf "${BOLD}${BLUE}║${WHITE}%*s%s%*s${BLUE}║${NC}\n" $padding "" "$title" $((SCREEN_WIDTH - padding - ${#title} - 9)) ""

    tput cup 2 0
    printf "${BOLD}${BLUE}╚"
    printf "═%.0s" $(seq 1 $((SCREEN_WIDTH - 2)))
    printf "╝${NC}\n"
}

draw_main_windows() {
    local window_height=$((SCREEN_HEIGHT - 12))
    local window_width=$((SCREEN_WIDTH / 2 - 2))

    # Left window (Frontend)
    tput cup 4 1
    printf "${WHITE}┌─ ${GREEN}${BOLD}FRONTEND CONSOLE ${WHITE}"
    printf "─%.0s" $(seq 1 $((window_width - 20)))
    printf "┐${NC}\n"

    # Right window (Backend)
    tput cup 4 $((window_width + 3))
    printf "${WHITE}┌─ ${YELLOW}${BOLD}BACKEND CONSOLE ${WHITE}"
    printf "─%.0s" $(seq 1 $((window_width - 19)))
    printf "┐${NC}\n"

    # Draw window borders
    for ((i = 1; i < window_height; i++)); do
        tput cup $((4 + i)) 1
        printf "│"
        tput cup $((4 + i)) $((window_width + 1))
        printf "│"
        tput cup $((4 + i)) $((window_width + 3))
        printf "│"
        tput cup $((4 + i)) $((SCREEN_WIDTH - 1))
        printf "│"
    done

    # Bottom borders
    tput cup $((4 + window_height)) 1
    printf "${WHITE}└"
    printf "─%.0s" $(seq 1 $((window_width - 1)))
    printf "┘${NC}"

    tput cup $((4 + window_height)) $((window_width + 3))
    printf "${WHITE}└"
    printf "─%.0s" $(seq 1 $((window_width - 1)))
    printf "┘${NC}"
}

draw_resource_panel() {
    local start_row=$((SCREEN_HEIGHT - 7))
    tput cup $start_row 1
    printf "${CYAN}${BOLD}┌─ SYSTEM RESOURCES "
    printf "─%.0s" $(seq 1 $((SCREEN_WIDTH - 21)))
    printf "┐${NC}\n"

    # Clear the resource area first
    for ((i = 1; i <= 4; i++)); do
        tput cup $((start_row + i)) 3
        printf "%-$((SCREEN_WIDTH - 6))s" ""
    done

    # Update resources every 5 refresh cycles (5 seconds)
    if [[ $((RESOURCE_UPDATE_COUNTER % 5)) -eq 0 ]]; then
        get_system_resources
    fi
    ((RESOURCE_UPDATE_COUNTER++))

    local line_num=1
    while IFS= read -r line && [[ $line_num -le 4 ]]; do
        tput cup $((start_row + line_num)) 3
        printf "${WHITE}%-$((SCREEN_WIDTH - 6))s${NC}" "$line"
        ((line_num++))
    done <"$RESOURCE_LOG"

    tput cup $((start_row + 5)) 1
    printf "${CYAN}└"
    printf "─%.0s" $(seq 1 $((SCREEN_WIDTH - 3)))
    printf "┘${NC}"
}

draw_keybind_history() {
    local start_row=$((SCREEN_HEIGHT - 1))
    tput cup $start_row 1

    local status_text=""
    if [[ $PAUSED == true ]]; then
        status_text="${RED}[PAUSED]${NC} "
    fi

    printf "${PURPLE}${BOLD}CONTROLS:${NC} ${status_text}${GRAY}[q]uit [h]elp [SPACE]pause [f]rontend [b]ackend [r]esources${NC}"
}

# Improved log display - only append new lines
update_log_display() {
    local window_height=$((SCREEN_HEIGHT - 12))
    local window_width=$((SCREEN_WIDTH / 2 - 4))

    # Check if frontend log has grown
    if [[ -f "$FRONTEND_LOG" ]]; then
        local current_size=$(wc -l <"$FRONTEND_LOG" 2>/dev/null || echo 0)
        if [[ $current_size -ne $FRONTEND_LOG_SIZE ]] || [[ $INITIAL_DRAW == true ]]; then
            # Clear frontend window content area
            for ((i = 0; i < $((window_height - 1)); i++)); do
                tput cup $((6 + i)) 3
                printf "%-${window_width}s" ""
            done

            # Display last N lines
            local line_num=0
            while IFS= read -r line && [[ $line_num -lt $((window_height - 1)) ]]; do
                tput cup $((6 + line_num)) 3
                printf "${GREEN}%-${window_width}s${NC}" "${line:0:$window_width}"
                ((line_num++))
            done < <(tail -n $((window_height - 1)) "$FRONTEND_LOG" 2>/dev/null)

            FRONTEND_LOG_SIZE=$current_size
        fi
    fi

    # Check if backend log has grown
    if [[ -f "$BACKEND_LOG" ]]; then
        local current_size=$(wc -l <"$BACKEND_LOG" 2>/dev/null || echo 0)
        if [[ $current_size -ne $BACKEND_LOG_SIZE ]] || [[ $INITIAL_DRAW == true ]]; then
            # Clear backend window content area
            for ((i = 0; i < $((window_height - 1)); i++)); do
                tput cup $((6 + i)) $((window_width + 7))
                printf "%-${window_width}s" ""
            done

            # Display last N lines
            local line_num=0
            while IFS= read -r line && [[ $line_num -lt $((window_height - 1)) ]]; do
                tput cup $((6 + line_num)) $((window_width + 7))
                printf "${YELLOW}%-${window_width}s${NC}" "${line:0:$window_width}"
                ((line_num++))
            done < <(tail -n $((window_height - 1)) "$BACKEND_LOG" 2>/dev/null)

            BACKEND_LOG_SIZE=$current_size
        fi
    fi
}

add_keybind_to_history() {
    KEYBIND_HISTORY+=("$1")
    if [[ ${#KEYBIND_HISTORY[@]} -gt $MAX_HISTORY ]]; then
        KEYBIND_HISTORY=("${KEYBIND_HISTORY[@]:1}")
    fi
}

show_help() {
    clear
    cat <<'EOF'
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         🚀 qBridge Help System 🚀                             ║
╚═══════════════════════════════════════════════════════════════════════════════╝

NAVIGATION CONTROLS:
  q, Q          - Quit the application
  f, F          - Focus on Frontend console
  b, B          - Focus on Backend console  
  r, R          - Focus on Resources panel
  h, H, ?       - Show this help screen
  SPACE         - Pause/Resume automatic refresh
  Ctrl+C        - Emergency exit

WINDOW LAYOUT:
  ┌─────────────────┬─────────────────┐
  │  Frontend Logs  │  Backend Logs   │
  │                 │                 │
  ├─────────────────┴─────────────────┤
  │         System Resources          │
  └───────────────────────────────────┘

SERVICES MONITORED:
  • PostgreSQL Database (Port 5432)
  • Frontend Server (Port 3000)  
  • Backend API (./backend/run.sh)
  • System Resources (CPU, Memory, Disk)

STARTUP MODES:
  --debug       Enable detailed logging
  --verbose     Enable verbose output  
  --production  Build and start frontend in production mode

Press any key to return to main view...
EOF
    read -n 1 -s
}

# Main display loop - much less aggressive refreshing
main_loop() {
    # Initialize display once
    printf "${HIDE_CURSOR}"
    printf "${CLEAR}${HOME}"

    draw_header
    draw_main_windows
    draw_resource_panel
    draw_keybind_history

    # Initial log display
    update_log_display
    INITIAL_DRAW=false

    while true; do
        # Only update what's necessary
        if [[ $PAUSED == false ]]; then
            update_log_display
            # Update resource panel less frequently
            if [[ $((RESOURCE_UPDATE_COUNTER % 5)) -eq 0 ]]; then
                draw_resource_panel
            fi
        fi

        # Always update the control bar to show pause status
        draw_keybind_history

        # Handle input with timeout for responsiveness
        if read -t $REFRESH_RATE -n 1 key; then
            case $key in
            'q' | 'Q')
                break
                ;;
            'f' | 'F')
                add_keybind_to_history "Frontend"
                ;;
            'b' | 'B')
                add_keybind_to_history "Backend"
                ;;
            'r' | 'R')
                add_keybind_to_history "Resources"
                draw_resource_panel # Force immediate update
                ;;
            'h' | 'H' | '?')
                show_help
                add_keybind_to_history "Help"
                # Redraw everything after help
                printf "${CLEAR}${HOME}"
                draw_header
                draw_main_windows
                draw_resource_panel
                draw_keybind_history
                INITIAL_DRAW=true
                update_log_display
                INITIAL_DRAW=false
                ;;
            ' ')
                if [[ $PAUSED == true ]]; then
                    PAUSED=false
                    add_keybind_to_history "Resume"
                else
                    PAUSED=true
                    add_keybind_to_history "Pause"
                fi
                ;;
            esac
        fi
    done

    printf "${SHOW_CURSOR}"
}

# Startup sequence
startup_sequence() {
    clear
    printf "${BOLD}${BLUE}🚀 qBridge Development Platform${NC}\n"
    printf "${BOLD}${BLUE}=================================${NC}\n\n"

    if [[ $DEBUG_MODE == true ]]; then
        printf "${YELLOW}🐛 Debug mode enabled${NC}\n"
        printf "${GRAY}Debug log: $DEBUG_LOG${NC}\n\n"
    fi

    if [[ $PRODUCTION_MODE == true ]]; then
        printf "${PURPLE}🏭 Production mode enabled${NC}\n\n"
    fi

    printf "${YELLOW}🔍 Checking dependencies...${NC}\n"
    if ! check_dependencies; then
        error_log "Dependency check failed"
        return 1
    fi
    printf "${GREEN}✓ Dependencies verified${NC}\n"

    printf "${YELLOW}🗄️  Starting database...${NC}\n"
    if ! start_database; then
        error_log "Database startup failed"
        return 1
    fi
    printf "${GREEN}✓ Database running${NC}\n"

    printf "${YELLOW}🔧 Starting backend...${NC}\n"
    if ! start_backend; then
        error_log "Backend startup failed"
        return 1
    fi
    printf "${GREEN}✓ Backend running (PID: $BACKEND_PID)${NC}\n"

    printf "${YELLOW}🌐 Starting frontend...${NC}\n"
    if ! start_frontend; then
        error_log "Frontend startup failed"
        return 1
    fi
    printf "${GREEN}✓ Frontend running (PID: $FRONTEND_PID)${NC}\n"

    # Mark services as successfully started
    SERVICES_STARTED=true
    debug_log "All services started successfully"

    # Now set the EXIT trap since services are running
    set_exit_trap

    printf "\n${BOLD}${GREEN}🎉 All services started successfully!${NC}\n"
    printf "${CYAN}Frontend: http://localhost:3000${NC}\n"
    printf "${CYAN}Database: localhost:5432${NC}\n"
    printf "${CYAN}Backend: Running via ./backend/run.sh${NC}\n\n"

    printf "${YELLOW}Starting window manager in 1 second...${NC}\n"

    if [[ $DEBUG_MODE == true ]]; then
        printf "${GRAY}Press Ctrl+C to view debug log and exit${NC}\n"
    fi

    sleep 1
    return 0
}

# Main execution
main() {
    debug_log "Starting qBridge main function"

    # Initialize log files
    if ! touch "$FRONTEND_LOG" "$BACKEND_LOG" "$RESOURCE_LOG" "$DEBUG_LOG" 2>/dev/null; then
        error_log "Failed to create log files"
        printf "${RED}Error: Cannot create log files in /tmp${NC}\n"
        printf "Please check /tmp directory permissions\n"
        exit 1
    fi

    debug_log "Log files initialized"

    # Check terminal size
    if [[ $SCREEN_WIDTH -lt 80 ]] || [[ $SCREEN_HEIGHT -lt 24 ]]; then
        error_log "Terminal too small: ${SCREEN_WIDTH}x${SCREEN_HEIGHT}"
        printf "${RED}Error: Terminal too small. Minimum size: 80x24${NC}\n"
        printf "Current size: ${SCREEN_WIDTH}x${SCREEN_HEIGHT}\n"
        printf "Please resize your terminal and try again.\n"
        exit 1
    fi

    debug_log "Terminal size OK: ${SCREEN_WIDTH}x${SCREEN_HEIGHT}"

    # Run startup sequence
    if ! startup_sequence; then
        error_log "Startup sequence failed"
        printf "${RED}Startup failed. Check the logs above for details.${NC}\n"
        if [[ $DEBUG_MODE == true ]]; then
            printf "${YELLOW}Debug log available at: $DEBUG_LOG${NC}\n"
        fi
        exit 1
    fi

    debug_log "Startup sequence completed successfully"

    # Start main interface loop
    if ! main_loop; then
        error_log "Main loop failed"
        printf "${RED}Interface loop failed${NC}\n"
        exit 1
    fi

    debug_log "Main function completed"
}

# Execute main function with error handling
if ! main "$@"; then
    error_log "Main function failed with exit code $?"
    if [[ $DEBUG_MODE == true ]]; then
        printf "${RED}Script failed. Debug information:${NC}\n"
        printf "${YELLOW}Debug log: $DEBUG_LOG${NC}\n"
        printf "${YELLOW}Frontend log: $FRONTEND_LOG${NC}\n"
        printf "${YELLOW}Backend log: $BACKEND_LOG${NC}\n"
        printf "${YELLOW}Resource log: $RESOURCE_LOG${NC}\n"
    fi
    exit 1
fi
