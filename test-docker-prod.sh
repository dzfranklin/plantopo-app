#!/usr/bin/env bash
set -euo pipefail

# Production Docker Test Script for PlanTopo
# Tests all entrypoint modes: server, worker, migrate

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
  echo ""
  echo -e "${YELLOW}[TEST]${NC} $1"
}

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Unique test identifier (timestamp)
TEST_ID=$(date +%s)

# Configuration variables
NETWORK_NAME="plantopo-test-net-${TEST_ID}"
DB_CONTAINER="plantopo-test-db-${TEST_ID}"
IMAGE_NAME="plantopo:test-${TEST_ID}"

# Cleanup function
cleanup() {
  EXIT_CODE=$?

  if [ $EXIT_CODE -eq 0 ]; then
    log_section "All tests passed - cleaning up"

    # Stop and remove all test containers
    docker ps -a | grep "plantopo-test.*${TEST_ID}" | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true

    # Remove network
    docker network rm ${NETWORK_NAME} 2>/dev/null || true

    # Remove test image
    docker rmi ${IMAGE_NAME} 2>/dev/null || true

    log_success "Cleanup complete"
  else
    log_error "Tests failed - keeping resources for debugging"
    log_info "Container name pattern: plantopo-test-*-${TEST_ID}"
    log_info "Network: ${NETWORK_NAME}"
    log_info "Image: ${IMAGE_NAME}"
    log_info ""
    log_info "To manually clean up, run:"
    log_info "  docker rm -f \$(docker ps -aq --filter name=plantopo-test)"
    log_info "  docker network rm ${NETWORK_NAME}"
    log_info "  docker rmi ${IMAGE_NAME}"
  fi
}

trap cleanup EXIT

# Start of main script
log_section "Production Docker Setup Tests"

# Prerequisite validation
log_info "Checking prerequisites..."

if ! docker info >/dev/null 2>&1; then
  log_error "Docker is not running. Please start Docker and try again."
  exit 2
fi

if [ ! -f ".env.production.example" ]; then
  log_error ".env.production.example not found"
  exit 2
fi

if [ ! -f "Dockerfile" ]; then
  log_error "Dockerfile not found"
  exit 2
fi

if [ ! -f "entrypoint.sh" ]; then
  log_error "entrypoint.sh not found"
  exit 2
fi

log_success "Prerequisites validated"

# Load environment variables from .env.production.example
log_info "Loading environment variables from .env.production.example..."
set -a
source .env.production.example
set +a

# Override DATABASE_URL to point to test container
export DATABASE_URL="postgresql://postgres:postgres@${DB_CONTAINER}:5432/plantopo-app"

log_success "Environment variables loaded"

# Pre-run cleanup
log_info "Cleaning up orphaned resources from previous runs..."
docker ps -a 2>/dev/null | grep plantopo-test | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true
docker network ls 2>/dev/null | grep plantopo-test | awk '{print $1}' | xargs -r docker network rm 2>/dev/null || true
docker images 2>/dev/null | grep "plantopo.*test" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
log_success "Cleanup complete"

# PostgreSQL Setup
log_info "Creating Docker network: ${NETWORK_NAME}"
docker network create ${NETWORK_NAME}
log_success "Network created"

log_info "Starting PostgreSQL container: ${DB_CONTAINER}"
docker run -d \
  --name ${DB_CONTAINER} \
  --network ${NETWORK_NAME} \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=plantopo-app \
  postgres:15-alpine >/dev/null

log_info "Waiting for PostgreSQL to be ready..."
timeout 30 bash -c "until docker exec ${DB_CONTAINER} pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done"
log_success "PostgreSQL is ready"

# Docker Image Build
log_info "Building Docker image: ${IMAGE_NAME}"
docker build -t ${IMAGE_NAME} . >/dev/null
log_success "Image built successfully"

log_info "Verifying build artifacts..."
docker run --rm --entrypoint ls "${IMAGE_NAME}" -la /app/build/server >/dev/null
docker run --rm --entrypoint ls "${IMAGE_NAME}" -la /app/build/client >/dev/null
docker run --rm --entrypoint ls "${IMAGE_NAME}" -la /app/build/worker >/dev/null
log_success "Build artifacts verified"

# Test 1: Migration Mode
log_section "Running migration mode test..."
CONTAINER_NAME="plantopo-test-migrate-${TEST_ID}"

if docker run --rm \
  --name ${CONTAINER_NAME} \
  --network ${NETWORK_NAME} \
  -e DATABASE_URL="${DATABASE_URL}" \
  -e BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET}" \
  -e BETTER_AUTH_URL="${BETTER_AUTH_URL}" \
  ${IMAGE_NAME} --migrate >/dev/null 2>&1; then
  log_success "Migration completed successfully"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  log_error "Migration failed"
  TESTS_FAILED=$((TESTS_FAILED + 1))
  exit 1
fi

# Test 2: Server Mode
log_section "Running server mode test..."
CONTAINER_NAME="plantopo-test-server-${TEST_ID}"

docker run -d \
  --name ${CONTAINER_NAME} \
  --network ${NETWORK_NAME} \
  -p 3000:3000 \
  -e DATABASE_URL="${DATABASE_URL}" \
  -e BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET}" \
  -e BETTER_AUTH_URL="${BETTER_AUTH_URL}" \
  ${IMAGE_NAME} >/dev/null

log_info "Waiting for server to start..."
if timeout 15 bash -c "until docker logs ${CONTAINER_NAME} 2>&1 | grep -q 'Server is running on http://localhost:3000'; do sleep 1; done"; then
  log_success "Server started"

  # Make HTTP request to /api/health
  log_info "Testing health endpoint..."
  sleep 2  # Give server a moment to fully initialize
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)

  if [ "$HTTP_CODE" -eq 200 ]; then
    log_success "Health check returned HTTP 200"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    log_error "Health check returned HTTP ${HTTP_CODE}, expected 200"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    docker logs ${CONTAINER_NAME}
    exit 1
  fi
else
  log_error "Server failed to start"
  TESTS_FAILED=$((TESTS_FAILED + 1))
  docker logs ${CONTAINER_NAME}
  exit 1
fi

# Stop and remove server container
docker stop ${CONTAINER_NAME} >/dev/null 2>&1
docker rm ${CONTAINER_NAME} >/dev/null 2>&1

# Test 3: Worker Mode
log_section "Running worker mode test..."
CONTAINER_NAME="plantopo-test-worker-${TEST_ID}"

docker run -d \
  --name ${CONTAINER_NAME} \
  --network ${NETWORK_NAME} \
  -e DATABASE_URL="${DATABASE_URL}" \
  -e BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET}" \
  -e BETTER_AUTH_URL="${BETTER_AUTH_URL}" \
  ${IMAGE_NAME} --worker >/dev/null

log_info "Waiting for worker to start..."
if timeout 15 bash -c "until docker logs ${CONTAINER_NAME} 2>&1 | grep -q 'Worker starting...'; do sleep 1; done"; then
  log_success "Worker started successfully"

  # Test graceful shutdown
  log_info "Testing graceful shutdown..."
  docker stop -t 5 ${CONTAINER_NAME} >/dev/null 2>&1
  LOGS=$(docker logs ${CONTAINER_NAME} 2>&1)

  if echo "$LOGS" | grep -q "Worker shutting down"; then
    log_success "Worker shutdown gracefully"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    log_error "Worker did not shutdown gracefully"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "$LOGS"
    exit 1
  fi
else
  log_error "Worker failed to start"
  TESTS_FAILED=$((TESTS_FAILED + 1))
  docker logs ${CONTAINER_NAME}
  exit 1
fi

docker rm ${CONTAINER_NAME} >/dev/null 2>&1

# Test 4: Error Handling
log_section "Running error handling test..."
CONTAINER_NAME="plantopo-test-error-${TEST_ID}"

# Run with invalid argument
set +e
docker run --rm \
  --name ${CONTAINER_NAME} \
  --network ${NETWORK_NAME} \
  -e DATABASE_URL="${DATABASE_URL}" \
  ${IMAGE_NAME} --invalid 2>&1 | tee /tmp/error-test-${TEST_ID}.log >/dev/null

EXIT_CODE=$?
set -e

if [ "$EXIT_CODE" -ne 0 ]; then
  log_success "Invalid argument properly rejected (exit code ${EXIT_CODE})"

  if grep -q "Error: Invalid argument '--invalid'" /tmp/error-test-${TEST_ID}.log; then
    log_success "Proper error message displayed"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    log_error "Expected error message not found"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    cat /tmp/error-test-${TEST_ID}.log
    exit 1
  fi
else
  log_error "Invalid argument should have failed but didn't"
  TESTS_FAILED=$((TESTS_FAILED + 1))
  exit 1
fi

# Clean up temp file
rm -f /tmp/error-test-${TEST_ID}.log

# Test Summary
log_section "Test Summary"
echo "Total tests: 4"
echo "Passed: ${TESTS_PASSED}"
echo "Failed: ${TESTS_FAILED}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  log_success "All production entrypoint tests passed!"
  exit 0
else
  log_error "${TESTS_FAILED} test(s) failed"
  exit 1
fi
