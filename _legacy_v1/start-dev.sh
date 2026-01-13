#!/bin/bash

# Define colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Restarting FTR Online Development Environment...${NC}"

# Kill ports (Backend: 8000, Frontend: 3000/3001/5173)
echo "Stopping existing services..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 2 # Wait for ports to release

# Start PHP Server
echo -e "${GREEN}Starting PHP Server on port 8000...${NC}"
/Applications/MAMP/bin/php/php8.3.28/bin/php -c php.ini -S localhost:8000 -t . > php-server.log 2>&1 &
PHP_PID=$!
echo "PHP Server started (PID: $PHP_PID)"

# Start Frontend
echo -e "${GREEN}Starting React Frontend...${NC}"
npm run dev
