#!/bin/bash

# Deploy .env file to server via SSH
# Usage: ./deploy-env.sh [server_path]

set -e

# Server configuration
SERVER_IP="37.27.181.109"
SERVER_USER="${DEPLOY_USER:-root}"
SERVER_PORT="${DEPLOY_PORT:-22}"
SERVER_PATH="${1:-~/chartfolio}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Deploy .env to Server"
echo "=========================================="
echo ""
echo "Server: ${SERVER_USER}@${SERVER_IP}:${SERVER_PORT}"
echo "Path: ${SERVER_PATH}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found in current directory${NC}"
    echo "Please create .env file first or run from the project root."
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will overwrite .env on the server!${NC}"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Step 1: Testing SSH connection..."
SSH_CMD="ssh"
if [ "${SERVER_PORT}" != "22" ]; then
    SSH_CMD="ssh -p ${SERVER_PORT}"
fi
if ! ${SSH_CMD} -o ConnectTimeout=5 "${SERVER_USER}@${SERVER_IP}" "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${RED}Error: Cannot connect to server${NC}"
    echo "Please check:"
    echo "  - Server IP: ${SERVER_IP}"
    echo "  - SSH port: ${SERVER_PORT}"
    echo "  - Username: ${SERVER_USER}"
    echo "  - SSH key is configured"
    exit 1
fi
echo -e "${GREEN}✓ SSH connection successful${NC}"

echo ""
echo "Step 2: Creating backup of existing .env on server..."
${SSH_CMD} "${SERVER_USER}@${SERVER_IP}" "
    if [ -f ${SERVER_PATH}/.env ]; then
        BACKUP_FILE=${SERVER_PATH}/.env.backup.\$(date +%Y%m%d_%H%M%S)
        cp ${SERVER_PATH}/.env \"\${BACKUP_FILE}\"
        echo \"Backup created: \${BACKUP_FILE}\"
    else
        echo \"No existing .env file to backup\"
    fi
" || {
    echo -e "${YELLOW}Warning: Could not create backup (this is okay if .env doesn't exist yet)${NC}"
}

echo ""
echo "Step 3: Creating directory if it doesn't exist..."
${SSH_CMD} "${SERVER_USER}@${SERVER_IP}" "mkdir -p ${SERVER_PATH}" || {
    echo -e "${RED}Error: Cannot create directory on server${NC}"
    exit 1
}
echo -e "${GREEN}✓ Directory ready${NC}"

echo ""
echo "Step 4: Uploading .env file..."
SCP_CMD="scp"
if [ "${SERVER_PORT}" != "22" ]; then
    SCP_CMD="scp -P ${SERVER_PORT}"
fi
if ${SCP_CMD} .env "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/.env"; then
    echo -e "${GREEN}✓ .env file uploaded successfully${NC}"
else
    echo -e "${RED}Error: Failed to upload .env file${NC}"
    exit 1
fi

echo ""
echo "Step 5: Verifying file on server..."
REMOTE_SIZE=$(${SSH_CMD} "${SERVER_USER}@${SERVER_IP}" "wc -c < ${SERVER_PATH}/.env" 2>/dev/null || echo "0")
LOCAL_SIZE=$(wc -c < .env | tr -d ' ')

if [ "$REMOTE_SIZE" = "$LOCAL_SIZE" ] && [ "$REMOTE_SIZE" != "0" ]; then
    echo -e "${GREEN}✓ File verified (${LOCAL_SIZE} bytes)${NC}"
else
    echo -e "${YELLOW}Warning: File size mismatch. Local: ${LOCAL_SIZE}, Remote: ${REMOTE_SIZE}${NC}"
fi

echo ""
echo "Step 6: Setting secure permissions..."
${SSH_CMD} "${SERVER_USER}@${SERVER_IP}" "chmod 600 ${SERVER_PATH}/.env" || {
    echo -e "${YELLOW}Warning: Could not set permissions${NC}"
}
echo -e "${GREEN}✓ Permissions set to 600 (read/write for owner only)${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps on the server:"
echo "  1. Navigate to: cd ${SERVER_PATH}"
echo "  2. Restart services: docker compose restart"
echo "  3. Or restart specific service: docker compose restart server"
echo ""
echo "To SSH to server:"
if [ "${SERVER_PORT}" != "22" ]; then
    echo "  ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_IP}"
else
    echo "  ssh ${SERVER_USER}@${SERVER_IP}"
fi
echo ""

