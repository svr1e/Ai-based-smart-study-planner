#!/bin/bash

echo "============================================"
echo "  Starting AI Study Planner"
echo "============================================"
echo "Make sure MongoDB is running: mongod"
echo

# Start backend
echo "Starting Spring Boot backend on port 8080..."
cd backend && mvn spring-boot:run &
BACKEND_PID=$!
cd ..

# Wait for backend
sleep 12

# Start frontend
echo "Starting React frontend on port 5173..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

sleep 3

echo
echo "============================================"
echo "  App running at: http://localhost:5173"
echo "  Backend API at: http://localhost:8080"
echo "  Press Ctrl+C to stop all servers"
echo "============================================"

# Open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
elif command -v open &> /dev/null; then
    open http://localhost:5173
fi

# Wait and cleanup on exit
wait $BACKEND_PID $FRONTEND_PID
