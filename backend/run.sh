#!/bin/bash
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "Starting Aerosepct FastAPI backend on http://localhost:8000"
echo "API docs: http://localhost:8000/docs"
echo ""
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
