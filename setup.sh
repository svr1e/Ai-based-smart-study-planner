#!/bin/bash

echo "============================================"
echo "  AI Study Planner - Setup Script (Mac/Linux)"
echo "============================================"
echo

echo "[1/4] Checking prerequisites..."

if ! command -v java &> /dev/null; then
    echo "ERROR: Java 17+ not found. Install from https://adoptium.net/"
    exit 1
fi

if ! command -v mvn &> /dev/null; then
    echo "ERROR: Maven not found. Run: brew install maven (Mac) or apt install maven (Ubuntu)"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Install from https://nodejs.org/"
    exit 1
fi

echo "All prerequisites found!"

echo
echo "[2/4] IMPORTANT: Edit backend/src/main/resources/application.properties"
echo "and set your GEMINI_API_KEY from https://aistudio.google.com"
echo
read -p "Press Enter when you've updated the API key..."

echo "[3/4] Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "[4/4] Building backend..."
cd backend && mvn clean install -DskipTests && cd ..

echo
echo "============================================"
echo "  Setup complete! Run ./start.sh to launch"
echo "============================================"
