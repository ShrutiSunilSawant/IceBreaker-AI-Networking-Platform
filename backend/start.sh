#!/bin/bash
set -e
echo "Starting on port: $PORT"
exec uvicorn main:app --host 0.0.0.0 --port $PORT
